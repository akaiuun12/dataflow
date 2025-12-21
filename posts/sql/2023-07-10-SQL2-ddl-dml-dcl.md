---
layout: post
category: SQL
tags: ['sql']

date: 2023-07-10
author: Akai Red
title: SQL 101 - DDL, DML, DCL 기초
description: 
    DDL은 데이터를 생성, 삭제, 수정한다. DML을 사용하면 데이터를 조회, 삽입, 삭제, 갱신할 수 있다.

image: 
    https://res.cloudinary.com/dhchweuhy/image/upload/c_fill,w_760,h_399,r_5,f_auto,q_auto/lrc/20220301_img1
optimized_image: 
    https://res.cloudinary.com/dhchweuhy/image/upload/c_fill,w_380,h_200,r_5,f_auto,q_auto/lrc/20220301_img1

show_thumbnail: true
math: true
published: true
---

## DDL (Data Definition Language)

DDL은 데이터 정의어(Data Definition Language)의 약자로 데이터를 생성, 삭제, 수정한다. 

### 테이블 생성 및 삭제: CREATE TABLE, DROP TABLE
```sql
-- 방법 1
CREATE TABLE 테이블명 (
    컬럼1 INTEGER PRIMARY KEY, 
    컬럼2 VARCHAR(14), 
    );

-- 방법 2
CREATE TABLE 테이블명 AS
SELECT 컬럼1, 컬럼2 
  FROM 기존테이블명;

DROP TABLE 테이블명;
```

`CREATE TABLE`을 사용해 2가지 방법으로 테이블을 만들 수 있다. 첫번째 방법은 컬럼명과 자료형을 직접 명시한다. 두번째 방법은 기존테이블의 일부를 가져와 새로운 테이블을 만든다. DB서버의 테이블을 매번 조회하는 것이 비효율적일 경우 두번째 방법을 사용해 자주 쓰는 테이블의 일부를 로컬 테이블로 만든다. 

`DROP TABLE`은 테이블을 완전히 삭제한다. DBA가 아니어도 로컬에서 만든 테이블을 삭제할 때 종종 사용한다. 중요한 테이블을 실수로 삭제하지 않도록 각별한 주의가 필요하다.


### 테이블 수정: ALTER TABLE
```sql
ALTER TABLE 테이블명 ADD 컬럼명 VARCHAR(13) NOT NULL;
ALTER TABLE 테이블명 ALTER 컬럼명 '기본값';
ALTER TABLE 테이블명 DROP COLUMN 컬럼명;
```
`ALTER TABLE`을 사용해서 테이블의 컬럼을 수정할 수 있다. `ADD` 명령어는 새로운 열을 추가한다. `NOT NULL`은 컬럼값이 누락되어서는 안된다는 의미이다.  `ALTER`는 기본값을 바꾸고 `DROP COLUMN`은 해당 컬럼을 지운다.

  
## DML (Data Manipulation Language)

데이터 조작어(Data Manipulation Language)인 DML을 사용하면 데이터를 조회, 삽입, 삭제, 갱신할 수 있다. 

### 데이터 조회: SELECT
```sql
SELECT * FROM 테이블명;
SELECT 컬럼1, 컬럼3, 컬럼7 FROM 테이블명;  -- 컬럼 1,3,7만 조회 (열 제한)
```
`SELECT`를 사용하여 데이터를 조회할 수 있다. 일부 컬럼만 보고 싶을 경우 `SELECT` 뒤에 컬럼명을 명시해준다. 전체 컬럼은 `*`로 지정한다. SQL을 사용하는 목적이 주로 데이터 조회이기 때문에 중요하다. `SELECT`를 사용하는 다양한 방법은 꾸준히 작성하고 여기서는 간략하게 넘어가기로 한다.


### 데이터 삽입: INSERT
```sql
-- 다중행 삽입 (방법 1)
INSERT INTO  테이블명(컬럼1, 컬럼2, ...) VALUES 값1, 값2, ...;
...
INSERT INTO  테이블명(컬럼1, 컬럼2, ...) VALUES 값1, 값2, ...;

-- 다중행 삽입 (방법 2)
INSERT INTO 테이블명(컬럼1, 컬럼2, ...)
SELECT 값1, 값2, ... FROM DUAL
UNION ALL
SELECT 값1, 값2, ... FROM DUAL;
```

데이터를 삽입하는 2가지 방법이 있다. 첫번째 방법은 `INSERT INTO ... VALUES` 명령으로 값을 직접 입력해준다. 두번째 방법은 `SELECT`를 사용한 방식이다. 상황에 따라 둘 중 편한 쪽을 사용하면 된다. 

한 번에 여러 행을 넣는 경우도 마찬가지다. `INSERT INTO ... VALUES`를 사용할 수도 있고, `SELECT`를 사용할 수도 있다. 데이터 수가 많다면 `SELECT`를 사용하는 것이 좋다. `INSERT` 사용 시 데이터를 넣을 칼럼을 지정해줘야 하는데 지정하지 않으면 전체 칼럼이 선택된다.


### 테이블 자료 삭제: DELETE
```sql
DELETE FROM 테이블명 WHERE 조건;  -- 조건에 맞는 데이터 삭제
DELETE FROM 테이블명;             -- 모든 데이터 삭제
DROP TABLE 테이블명;              -- 테이블 삭제
```
`DELETE`는 테이블의 자료를 삭제한다. `DELETE`와 `WHERE` 조건절을 사용하면 삭제할 데이터의 범위를 정해줄 수 있다. 조건을 걸지 않고 `DELETE` 명령을 실행하면 테이블의 모든 행이 사라지지만 테이블 오브젝트는 남는다. 

`DROP`과 `DELETE`는 비슷한 역할을 하지만 다르다. `DROP`은 DDL, `DELETE`는  DML이다. `DROP TABLE`을 사용하면 테이블 오브젝트까지 사라져 새로 생성해야 한다. 


### 테이블 갱신: UPDATE
```sql
UPDATE 테이블명 SET 컬럼명 = '치환값' WHERE 조건;
```
기존 테이블의 자료를 수정하고 싶을 경우 `UPDATE`를 사용한다. 실무에서는 별로 쓸 일이 없는데 데이터를 수정할 일이 별로 없을 뿐더러 `UPDATE`를 사용해 수정하면 데이터 무결성을 보장하기 힘들기 때문이다.


## DCL, TCL (Data/Transaction Control Language)

데이터 제어어(Data Control Language)인 DCL을 사용하면 데이터 권한을 관리할 수 있다. 트랜잭션 제어어(Transaction Control Language)인 TCL은 `COMMIT`, `ROLLBACK` 등의 명령어로 트랜잭션을 관리한다. 둘을 구분하는 경우도 있지만 DCL이라고 묶어서 부르는 경우도 있다.

### 권한 부여 및 취소: GRANT, REVOKE
```sql
GRANT  SELECT, INSERT, DELETE, UPDATE, ALTER 
   ON 테이블명 TO 사용자;    -- 권한 부여
REVOKE SELECT, INSERT, DELETE, UPDATE, ALTER 
   ON 테이블명 FROM 사용자;  -- 권한 취소
```
`GRANT` 명령을 사용하면 다른 사용자에게 특정 테이블에 대한 조회, 수정, 삭제 등의 권한을 부여할 수 있다. 부여한 권한을 회수하려면 `REVOKE`를 사용하면 된다.

### DB 반영 및 취소: COMMIT, ROLLBACK
```sql
COMMIT;   -- 커밋 (데이터베이스에 반영)
ROLLBACK; -- 롤백 (변경내용을 데이터베이스에 반영하지 않음)
```
`COMMIT`은 데이터베이스에 변경내용을 반영한다. `ROLLBACK`은 아직 커밋되지 않은 모든 변경내역을 취소하고 데이터베이스를 이전 상태로 되돌린다.