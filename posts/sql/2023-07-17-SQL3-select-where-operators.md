---
layout: post
category: SQL
tags: ['sql']

date: 2023-07-17
author: Akai Red
title: SQL 101 - SELECT, WHERE와 연산자
description: 
    특정 조건을 만족하는 결과만을 출력하고 싶을 때 SELECT, WHERE절과 연산자를 사용할 수 있다.

image: 
    https://res.cloudinary.com/dhchweuhy/image/upload/c_fill,w_760,h_399,r_5,f_auto,q_auto/lrc/20220301_img1
optimized_image: 
    https://res.cloudinary.com/dhchweuhy/image/upload/c_fill,w_380,h_200,r_5,f_auto,q_auto/lrc/20220301_img1

show_thumbnail: true
math: true
published: true
---

SQL은 데이터베이스에서 원하는 데이터를 조회하기 위해 주로 사용한다. 특정 조건을 만족하는 결과를 조회하고 싶을 때 SELECT, WHERE절과 연산자를 사용할 수 있다. SELECT절에서는 산술, 연결 연산자를 사용하고 WHERE절에서는 비교, 논리 연산자를 사용한다. 


## 조회: SELECT
### SELECT 기본
```sql
SELECT * FROM 테이블명;
SELECT 컬럼1, 컬럼3, 컬럼7 FROM 테이블명;  -- 컬럼 1,3,7만 조회 (열 제한)
SELECT * FROM 테이블명 WHERE ROWNUM < 10; -- 10행 미만 데이터만 출력 (행 제한)

SELECT 12/48 FROM DUAL;                   -- 임시 테이블 DUAL
SELECT COUNT(*) FROM 테이블명;             -- 전체 자료 크기 조회 (NULL 포함)
SELECT COUNT(컬럼명) FROM 테이블명;         -- 특정 컬럼 크기 조회 (NULL 제외)
SELECT COUNT(DISTINCT 컬럼명) FROM 테이블명;-- 특정 컬럼 크기 조회 (중복 제외)
```
`SELECT`를 사용하여 데이터를 조회할 수 있다. 일부 컬럼만 보고 싶을 경우 `SELECT` 뒤에 컬럼명을 명시해준다. 전체 컬럼은 `*`로 지정한다. Oracle에서는 `WHERE ROWNUM < N`을 사용하면 상위 N-1개 데이터를 확인할 수 있다. 다른 SQL에서는 `LIMIT N`을 사용하기도 한다.

`SELECT`는 `DUAL`은 단순한 계산이나 집계함수의 결과를 조회할 때도 사용한다. 가장 자주 사용하는 집계함수는 `COUNT`, `MIN`, `MAX`, `AVG`, `SUM` 등이다. `DUAL`은 간단한 계산을 위한 임시 테이블이며 따로 생성하지 않아도 사용할 수 있다. 

`SELECT COUNT(*) FROM 테이블명;`로 전체 데이터의 크기를 확인할 수 있다. `NULL` 값을 포함한 전체 데이터의 크기를 알고 싶으면 `COUNT(*)`를, `NULL` 값을 제외하고 싶으면 `COUNT(컬럼명)`를 사용하자. 중복을 제거한 크기를 알고 싶으면 `COUNT(DISTINCT 컬럼명)`을 사용한다.


### ALIAS: AS
```sql
SELECT 테이블명.* FROM 테이블명;
SELECT 테이블명.컬럼1, 테이블명.컬럼2 FROM 테이블명;

SELECT 실험결과.컬럼1 AS 독립변수1   -- 열 이름 변경 
     , 실험결과.컬럼7 AS 종속변수 
  FROM 테이블명 실험결과             -- 테이블명 변경 (임시)
;
```
`테이블명.*`를 사용하면 테이블의 전체 컬럼을 조회한다. 테이블이 하나일 경우에는 `*`와 똑같지만 여러 테이블을 조인할 경우 필요하다. 일부 컬럼만 조회하고 싶다면 `테이블명.컬럼1`, `테이블명.컬럼2`처럼 직접 써주자. 

`AS`를 사용해 열이름을 변경할 수 있다. 테이블명을 임시 지칭할 때는 `AS`없이 바로 뒤에 쓴다. 


### DISTINCT

| 컬럼 1| 컬럼 2|
|-|-|
| Sam | 300 |
| Sam | 18500 |
| Mike | 300 |
| Mike | 600 |
| Mike | 300 |

```sql
SELECT DISTINCT 컬럼1, 컬럼2
  FROM 테이블명;
```
`DISTINCT`는 `COUNT` 함수와 별개로 사용할 수 있으며 그 경우 중복을 제외한 값을 모두 보여준다. 중요한 것은 `DISTINCT`는 주어진 모든 컬럼 조합에 대한 유일한 값을 반환한다는 것이다. 주어진 테이블 및 쿼리가 다음과 같을 때, 어떤 결과가 나올까?

| 컬럼 1 | 컬럼 2|
|-|-|
| Sam | 300 |
| Sam | 18500 |
| Mike | 300 |
| Mike | 600 |

정답은 위와 같다. `DISTINCT`를 사용했음에도 컬럼1과 2에 각각 중복값이 존재한다. `DISTINCT`는 컬럼별 중복 제거가 아니라, 전체 컬럼의 조합에 대한 중복 제거이기 때문이다. 


## 조건문: WHERE
```sql
SELECT ENAME, SAL
  FROM EMP
 WHERE SAL > 2000
   AND ENAME != 'MIKE'
   AND JOB IN ('SALESMAN', 'MANAGER') 
    OR HIREDATE BETWEEN '01-01-1981' AND '06-30-1981' 
```
`WHERE`를 사용해 특정 조건을 만족하는 결과만을 출력할 수 있다. `FROM`절 다음에 작성하며 구체적인 조건은 비교연산자, 논리연산자를 사용해 작성한다. 비교연산자로는 `=`, `>`, `>=`, `!=` 등이 있으며, 논리연산자는 `AND`, `OR`, `NOT` 등이 있다. 


## 연산자: Operators
연산자(Operators)는 SELECT절이나 FROM절 등에 사용해 보다 복잡한 조회를 가능케한다. 글마다 연산자 종류에 대한 설명이 조금씩 다른데 이 글에서는 [Oracle 공식 홈페이지의 분류](https://docs.oracle.com/cd/E12095_01/doc.10303/e12092/sqopr.htm)를 따른다. 연산자의 종류는 아래와 같다.

1. 산술 연산자 Arithmetic Operators
1. 연결 연산자 Character Operators
1. 비교 연산자 Comparison Operators
1. 논리 연산자 Logical Operators
1. 집합 연산자 Set Operators
1. 기타 연산자 Other Operators

산술 연산자와 연결 연산자는 주로 `SELECT`절에서 활용한다. 비교 연산자와 논리 연산자는 `WHERE`절에서 사용한다. 집합 연산자와 기타 연산자는 다른 글에서 따로 소개하도록 하겠다.


### 산술 연산자 Arithmetic Operators
```sql
-- 산술 연산자 Arithmetic Operators
SELECT +3, -4 FROM DUAL;              -- 단항(unary) 연산자
SELECT 1/4, 2*5, 7+2, 3-2 FROM DUAL;  -- 이항(binary) 연산자
```
산술 연산자는 단항/다항연산자로 나뉜다. 왜 단항/다항인지는 예시를 보면 쉽게 알 수있다. 주로 `SELECT`절에서 컬럼에 수리적 연산을 하기 위해 사용한다. 숫자형 컬럼에도 사용할 수 있으며 추후 설명할 집계함수와 같이 사용하는 경우가 많다.

### 연결 연산자 Character Operator: ||
```sql
SELECT 'Hello' || 'World'             -- Oracle에서만 사용가능
     , CONCAT('Hello', 'World')       -- 다른 SQL에서도 사용가능
     , 'Hello' || 'From' || 'Red'     -- ||는 세 개 이상 문자열 연결 가능
--   , CONCAT('Hello', 'From', 'Red') -- Oracle CONCAT(A,B)은 인수 2개 제한
  FROM DUAL;
```
문자열을 합쳐야할 경우 연결 연산자 `||`를 사용한다. `||`는 Oracle만의 표기이며 다른 SQL에서는 논리 연산자 OR 등 전혀 다른 의미를 갖는다. 범용성을 생각하면 `CONCAT`을 사용하는 것이 좋지만 3개 이상의 문자열을 합칠 때 불편하다. 이는 Oracle 기준이며 다른 SQL에서는 `CONCAT`을 사용해서 3개 이상의 문자열 연결이 가능한 경우도 있다.

### 비교 연산자 Comparison Operator
```sql
SELECT * FROM PATIENTS 
 WHERE PATIENT_CD = 01                   -- 환자 코드가 01이고    (= 같음) 
   AND SEX != 'FEMALE'                   -- 성별이 여성이 아니고  (!= 같지 않음)
   AND BLOOD_PRESSURE > 160              -- 혈압이 160 초과이고   (> 크다, < 작다)
   AND REGION IN ('서울', '경기', '인천') -- 거주지가 수도권이고     
   AND AGE BETWEEN 30 AND 60             -- 30세 이상 60세 이하고
   AND PREV_VISIT IS NOT NULL            -- 이전 방문이력이 NULL이 아닌
;
```
비교 연산자는 `WHERE`절에서 보다 복잡한 조건을 구현할 수 있게 해준다. `=`, `!=`, `>`, `<` 등이 비교 연산자이다. 어떤 설명에서는 `IN`, `BETWEEN`, `IS NULL` 등을 따로 묶는데 이 글에서는 Oracle 공식 홈페이지 기준에 따라 모두 비교 연산자로 취급한다. 이외에도 `ANY`, `ALL` 등의 비교 연산자가 있다.

### 문자열 조건문을 위한 비교 연산자: LIKE
```sql
SELECT * FROM EMP
 WHERE ENAME LIKE 'SAM%';   --'SAM'으로 시작하는 값 : SAM, SAMUEL
   AND ENAME LIKE '%SAM';   --'SAM'으로 끝나는 값   : SAM, ASSAM
   AND ENAME LIKE '%SAM%';  --'SAM'을 포함하는 값   : SAM, ASSAM, SAMUEL
   
   AND ENAME NOT LIKE 'SAM' --'SAM'이 아닌 값       : ASSAM, SAMUEL 
   AND ENAME LIKE '___A_'   -- 다섯자리 값 중 네번째 값이 'A'인 값 : ASSAM
   AND UPPER(ENAME) LIKE 'SAM' -- 대소문자 구분 X   : Sam, SAM, sAM 
```
비교 연산자 `LIKE`는 문자열 조회를 위한 특수한 비교 연산자다. 와일드카드와 조합하여 특정 조건을 만족하는 문자열 데이터를 조회할 수 있다. 

와일드카드 `%`는 어느 위치에 들어가느냐에 따라 의미가 달라진다. 와일드카드 `_`는 데이터의 자릿수를 지정한다. `_`를 다섯번 반복하면 다섯자리 문자열만을 결과로 반환한다. 이를 이용하여 특정 위치(ex.네번째)에 있는 문자열을 조건으로 걸 수 있다. 와일드카드를 잘 사용해야 원하는 문자열만 조회할 수 있다. 

가끔은 데이터의 대소문자 형식이 통일되어 있지 않다. 이럴 때는 `UPPER` 혹은 `LOWER`를 사용해야 정확하게 필터링할 수 있다.

문자열 조건절은 편리하지만 무턱대고 사용하면 성능에 문제를 일으킬 수 있다. 이와 관련해서는 추후 인덱스 튜닝 관련 글에서 따로 다룬다.

#### 논리 연산자 Logical Operators: NOT, AND, OR
```sql
SELECT * FROM EMP
 WHERE NOT SAL BETWEEN 3000 AND 4000 -- 아래 두 줄과 논리적으로 동일하다
   AND SAL < 3000
    OR SAL > 4000
```
논리 연산자는 `NOT`, `AND`, `OR`가 있다. 다른 프로그래밍 언어나 일상에서도 자주 사용하기 때문에 어렵지는 않다. 논리 연산자는 비교연산자와 마찬가지로 WHERE절에서 사용한다. 

위쪽 조건은 `NOT`과 `BETWEEN`을 써서, 아래 조건은 `OR`와 `>`,`<`를 사용해서 만들었다. 둘은 논리적으로 동일하다. 그럼 어느 쪽을 써야할까? 작은 규모의 데이터에서는 큰 상관이 없지만 데이터 크기가 커지면 중요한 문제다. 쿼리 최적화 및 튜닝글에서 이에 관해 다룰 것이다.


<!-- ### 연산자 우선순위
| 우선순위 | 연산자 | 설명 |
|-|-|-|
| 1 | *, /, +, - | 산술 연산자 |
| 2 | =, !=, <, >, >=, <=, <> | 비교 연산자 |
| 3 | LIKE, BETWEEN, IN, IS NULL | 비교 연산자 |
| 4 | NOT | 논리 연산자 |
| 5 | AND | 논리 연산자 |
| 6 | OR  | 논리 연산자 | -->


## 정규표현식: REGEXP

> '[SYSTEM]ERROR_심각한 오류가 발생했습니다._2023.10.23'

```sql
SELECT REGEXP_SUBSTR(ERROR, '[^_]+', 1, 1) AS STR1 
      ,REGEXP_SUBSTR(ERROR, '[^_]+', 1, 2) AS STR2
      ,REGEXP_SUBSTR(ERROR, '[^_]+', 1, 3) AS STR3
  FROM ERRORLOG
;
-- STR1           STR2                      STR3      
-- [SYSTEM]ERROR  심각한 오류가 발생했습니다. 2023.10.23
```
`REGEXP`를 사용하면 오라클에서 정규표현식을 사용하여 보다 복잡한 문자열을 처리할 수 있다. 
<!-- 정규표현식의 사용방법은 [이 글](_posts/4.nlp/4-1.textmining/2023-10-13-regex.md)을 참고하기 바란다. -->

`REGEXP_SUBSTR`는 정규표현식과 일치하는 문자열을 반환한다. `REGEXP_SUBSTR(문자열, 패턴, 시작위치, 결과그룹)`의 형식으로 되어있다. `'[^_]+'`는 `_`와 일치하지 않는 모든 문자라는 뜻으로, 위의 쿼리는 주어진 문자열을 구분자*delimiter* `_`를 기준으로 나눈 값을 반환한다.

```sql
SELECT ERROR FROM ERRORLOG
 WHERE REGEXP_LIKE(ERROR, '^\[SYSTEM\]')

-- ERROR
-- [SYSTEM]ERROR_심각한 오류가 발생했습니다._2023.10.23
```

`REGEXP_LIKE`는 특정행이 정규표현식과 일치하는지 확인한다. 주로 `WHERE`절에 사용하며 파라미터로는 데이터 컬럼과 패턴을 받는다. 위의 쿼리는 `ERROR`컬럼에서 `[SYSTEM]`으로 시작하는 행을 반환한다. 대괄호를 이스케이프하기 위해 `[` 대신  `\[`, `]` 대신 `\]`를 사용했다. 


## References
* [Oracle 공식 홈페이지 - 2 SQL Operators](https://docs.oracle.com/cd/E12095_01/doc.10303/e12092/sqopr.htm)