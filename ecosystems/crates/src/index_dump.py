#!/usr/bin/env python3
"""Reduce the crates.io database dump to the columns the count needs, in SQLite.

usage: index_dump.py <dump-dir> <out.sqlite>

versions: crate name, version number, publishing user id (null under trusted
publishing and before crates.io recorded publishers). users: GitHub login.
crate_owners: user and team owners per crate. Nothing else is kept.
"""
import csv, json, os, sqlite3, sys
csv.field_size_limit(1 << 30)
D, OUT = sys.argv[1], sys.argv[2]
if os.path.exists(OUT): os.remove(OUT)
db = sqlite3.connect(OUT)
db.executescript('''
create table meta(k text primary key, v text);
create table crates(id integer primary key, name text);
create table versions(crate_id integer, num text, published_by integer);
create table users(id integer primary key, login text);
create table teams(id integer primary key, login text);
create table owners(crate_id integer, owner_id integer, kind integer);
''')
db.execute('insert into meta values (?,?)', ('dump', open(os.path.join(D, 'metadata.json')).read()))

def rows(name):
    with open(os.path.join(D, 'data', name), newline='', encoding='utf8') as f:
        yield from csv.DictReader(f)

db.executemany('insert into crates values (?,?)', ((int(r['id']), r['name']) for r in rows('crates.csv')))
db.executemany('insert into versions values (?,?,?)',
               ((int(r['crate_id']), r['num'], int(r['published_by']) if r['published_by'] else None)
                for r in rows('versions.csv')))
db.executemany('insert into users values (?,?)', ((int(r['id']), r['gh_login']) for r in rows('users.csv')))
db.executemany('insert into teams values (?,?)', ((int(r['id']), r['login']) for r in rows('teams.csv')))
db.executemany('insert into owners values (?,?,?)',
               ((int(r['crate_id']), int(r['owner_id']), int(r['owner_kind'])) for r in rows('crate_owners.csv')))
db.executescript('''
create index crates_name on crates(name);
create index versions_key on versions(crate_id, num);
create index owners_crate on owners(crate_id);
''')
db.commit()
for t in ('crates', 'versions', 'users', 'teams', 'owners'):
    print(t, db.execute(f'select count(*) from {t}').fetchone()[0])
