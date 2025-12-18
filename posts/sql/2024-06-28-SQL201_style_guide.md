---
layout: post
category: SQL
tags: ['sql']

date: 2024-06-28
author: Akai Red
title: SQL 201 - 가독성을 위한 개인적인 SQL 스타일 가이드
description: 
  가독성 좋은 쿼리를 짜고 싶어 몇몇 가이드라인을 참조하며 정립한 내 스타일의 SQL 가이드를 정리해본다.

image: 
  https://res.cloudinary.com/dhchweuhy/image/upload/c_fill,w_760,h_399,r_5,f_auto,q_auto/lrc/20220301_img1
optimized_image: 
  https://res.cloudinary.com/dhchweuhy/image/upload/c_fill,w_380,h_200,r_5,f_auto,q_auto/lrc/20220301_img1

show_thumbnail: true
math: true
published: true
---

SQL은 문법 제약이 덜하다. 띄어쓰기도 대소문자도 크게 가리지 않는다. 그렇다보니 분석가마다 쿼리가 매우 달라 통일성이 떨어진다. 가독성 좋은 쿼리를 짜고 싶어 몇몇 가이드라인을 참조하며 정립한 내 스타일의 SQL 가이드라인을 정리해본다.


## 1. 가이드라인 준수 Following the Guideline

이 장에서는 일반적인 가이드라인의 지침을 소개한다. [Simon Holywel SQL Style Guide](https://www.sqlstyle.guide/ko/), [Mozilla(Firefox) SQL Style Guide](https://docs.telemetry.mozilla.org/concepts/sql_style.html#reserved-words), [GitLab SQL Style Guide](https://about.gitlab.com/handbook/business-technology/data-team/platform/sql-style-guide/)를 참고 했다. 대부분의 경우 이 원칙에 따라 쿼리를 작성하길 권한다.

### WITH vs Subquery
서브쿼리 대신 `WITH`절을 사용한 CTE(Common Table Expression) 형식을 쓰자. `SELECT`절 안에 `SELECT`절을 사용하는 것을 서브쿼리*Subquery*라고 부른다. 2002년에 Oracle 9.2버전이 출시되기 이전에는 `WITH`절이 없었다. 그래서 옛날 쿼리에는 서브쿼리를 이중, 삼중으로 사용하는 경우가 많았다. 가독성이 좋지 않으므로 `WITH`을 사용하자.

```sql
WITH t1 AS(
  SELECT customer_id, customer_name
    FROM customers
   WHERE sample_id != '42'
)
SELECT *
  FROM t1
 WHERE ROWNUM < 10
;
```

### ANSI Join vs Oracle Join
Oracle에서 ANSI Join을 사용할 것을 권한다. ANSI Join은 조인 방법을 명시함으로써 쿼리 작성 시 오류를 줄여주고 다른 DBMS에서도 동일하게 사용할 수 있다. `(+)`를 사용하는 Non-ANSI Join(Oracle Join)은 상기한 이유로 인해 권장하지 않는다. 

```sql
-- Good
SELECT ...
  FROM purchase_table A
 INNER JOIN customer_table B
    ON A.customer_id = B.customer_id;

-- Bad
SELECT ...
  FROM purchase_table A, customer_table B
 WHERE A.customer_id = B.customer_id;
```

### CASE WHEN vs DECODE
```sql
-- Good
SELECT CASE WHEN product_type = '1' THEN '신선식품'
            WHEN product_type = '2' THEN '냉동식품'
            ELSE '일반식품' END AS fresh_type
  FROM Product
... 

-- Bad
SELECT DECODE(product_type, '1', '신선식품', '2', '냉동식품', '일반식품') AS fresh_type
  FROM Product
... 
```
가능하면 DECODE 대신 CASE를 사용하라. CASE는 명령문, DECODE는 함수이다. 이러한 차이로 인해 CASE가 더 복잡한 조건을 다룰 수 있으며 Oracle이 아닌 다른 SQL 언어에서도 사용가능하다. 또한 CASE의 형식이 프로그래머들이 일반적으로 익숙한 조건문 형식과 더 유사하다. DECODE를 사용하면 CASE에 비해 짧게 쿼리를 작성할 수 있지만, 복잡한 조건문을 DECODE로 작성하면 읽기 어려운 쿼리가 된다.


## 2. 의도적 규칙 위반 Intentional Violations

이 장에서는 가이드라인에 존재하지만 실무에서 쿼리를 작성하면서 의도적으로 어긴 규칙들은 소개한다. 물론 가이드를 어겼지만 가독성을 높이기 위함이라는 목적은 동일하다.

### 명명 규칙 (Naming Convention)
```sql
-- Good (but..)
SELECT customer_id FROM mgk34sdk2;

-- Bad (but...)
SELECT CUSTOMER_ID FROM MGK34SDK2;
```
많은 SQL 가이드에서 `SELECT`, `FROM` 등의 예약어는 대문자로, 컬럼이나 테이블명 등은 소문자로 작성하라고 권한다. 역할에 따라 대소문자를 구분해서 보다 가독성을 높이기 위한 것으로 보인다. 

그러나 나는 가이드를 깨고 실무에서는 전부 대문자로 사용한다. 실무에서 내가 쓰는 에디터는 VS 코드보다 가독성이 낮아 소문자가 잘 보이지 않는다. 주요 테이블도 일련번호 형태로 되어있다. 이런 경우에는 대문자가 소문자보다 가독성이 좋았다. 


## 3. 개인적 선호도(Personal Preferences)

이 장에서는 가이드라인에서 잘 다루어지지 않거나 합의되지 않은 사례들을 개인적인 기준에 따라 정리한다.

```sql
SELECT /*+ FULL(B) PARALLEL(B 8) */
       A.customer_id
     , A.customer_name
     , B.product_id
  FROM customers    AS A
 INNER JOIN sales   AS B
    ON A.customer_id = B.customer_id
 WHERE 1=1
   AND A.customer_valid != 'N'
;
```

### SELECT 뒤 줄바꿈 Blank after SELECT
`SELECT` 명령어 다음에 줄을 바꾼다. 빈 공간에는 힌트절을 적는다. 힌트절을 적지 않거나 조회하는 컬럼의 수가 적을 경우에는 바로 붙여쓰기도 한다.

```sql
SELECT /*+ FULL(B) PARALLEL(B 8) */
       A.customer_id
```

### 중앙 정렬 River Indentation
명령어를 우측 정렬, 컬럼 및 조건을 좌측 정렬한다. 쓰기에는 불편하지만 읽기에는 편하다. Simon Holywel의 가이드가 이러한 방식을 따른다. 다만 `JOIN`문의 정렬에 대해서는 나와 약간의 차이가 있다. 

```sql 
SELECT ...
  FROM ...
 INNER JOIN ...
    ON ...
 WHERE ...
   AND ...
```

### 콤마 먼저 Pre-comma
각 컬럼을 하나의 행으로 구분하고 첫 컬럼을 제외한 나머지 컬럼은 콤마(,)를 앞에 붙인다. 작성할 때 시간이 조금 더 걸릴 수는 있지만 구문 오류를 줄일 수 있고 컬럼을 하나씩 주석 처리하기에도 훨씬 편리하다.

```sql
SELECT 
       A.customer_id
     , A.customer_name
     , B.product_id
```

### 조건문 시작은 WHERE 1=1
`WHERE 1=1`을 첫 줄에 사용하고 상세 조건을 아래에 `AND`를 사용해서 붙인다. `WHERE`절 조건은 주석 처리하는 경우가 많다. `WHERE` 바로 뒤에 조건이 나오면 주석 처리가 불편하기 때문에 `1=1`이라는 더미 코드를 작성한다.

```sql
 WHERE 1=1
   AND ...
```

### 같지 않음 Not Equal !=
다른 프로그래밍 언어와의 통일성을 이유로 같지 않음을 `!=`로 쓰는 쪽을 선호한다. SQL에서는 `<>`도 같지 않음을 나타낸다. 둘 중 어느 쪽을 사용해야 하는지는 논란이 있다. SQL-92 Standard는 `<>`를, GitLab guide는 `!=`를 쓰라고 하지만 수정이 어렵지 않기 때문에 많은 사람들은 어느 쪽을 사용해도 괜찮다고 본다. 

```sql
 WHERE 1=1
   AND A.customer_valid != 'N'
```

## References
* [Simon Holywel SQL Style Guide](https://www.sqlstyle.guide/ko/)
* [Mozilla(Firefox) SQL Style Guide](https://docs.telemetry.mozilla.org/concepts/sql_style.html#reserved-words)
* [GitLab SQL Style Guide](https://about.gitlab.com/handbook/business-technology/data-team/platform/sql-style-guide/)
