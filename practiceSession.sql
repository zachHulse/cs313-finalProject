Database: practice

create table musician(
id serial not null primary key,
username varchar(32) not null unique,
email varchar(64) not null,
password varchar(64) not null);

create table instrument(
id serial not null primary key,
name varchar(32) not null);

create table category(
id serial not null primary key,
name varchar(32) not null);

create table idea(
id serial not null primary key,
name varchar(32) not null,
descript text,
min_time int not null,
max_time int not null,
instrument_id int not null references instrument,
category_id int not null references category);

create table musician_link(
musician_id int not null references musician,
idea_id int not null references idea);

create table practice_session(
id serial not null primary key,
name varchar(32) not null);

create table session_link(
session_id int not null references practice_session,
idea_id int not null references idea, 
idea_time int not null);

drop table session_link;
drop table practice_session;
drop table musician_link;
drop table idea;
drop table category;
drop table instrument;
drop table musician;