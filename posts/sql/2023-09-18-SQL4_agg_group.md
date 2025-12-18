---
layout: post
category: SQL
tags: ['sql']

date: 2023-09-18
author: Akai Red
title: SQL 101 - Aggregate Function & Group By
description: 
    데이터의 개수, 합계, 최대값, 최소값을 구하는 간단한 함수들이 SQL에 마련되어 있다.

image: 
    https://res.cloudinary.com/dhchweuhy/image/upload/c_fill,w_760,h_399,r_5,f_auto,q_auto/lrc/20220301_img1
optimized_image: 
    https://res.cloudinary.com/dhchweuhy/image/upload/c_fill,w_380,h_200,r_5,f_auto,q_auto/lrc/20220301_img1

show_thumbnail: true
math: true
published: true
---

## 집계 함수 (Aggregate Function)
데이터의 개수, 합계, 최대값, 최소값을 구하는 간단한 함수들이 SQL에 마련되어 있다. 이 함수들을 집계 함수(Aggregate Function)라고 부른다. 아래에서 대표적인 집계 함수를 소개한다.

```sql
SELECT COUNT(*)                 -- number of all data
     , COUNT(전화번호)           -- number of non-null data in certain column
     , COUNT(DISTINCT 전화번호)  -- number of distinct data in certain column
     , AVG(연수입)               -- average income
     , MIN(나이), MAX(나이)      -- minimum and maximum age                 
  FROM EMP
```

`COUNT`는 데이터의 개수를 출력하는 함수로 `COUNT(*)` 형태로 사용하면 모든 데이터의 개수를 출력한다. 단순하면서도 많이 쓰이는 `COUNT(*)`는 집계 함수 중 예외적으로 `NULL` 값을 포함한다. `NULL` 값을 포함한 전체 데이터의 크기를 알고 싶으면 `COUNT(*)`를, `NULL` 값을 제외하고 싶으면 `COUNT(1)`을 사용하자.

`COUNT(컬럼명)`은 지정한 컬럼의 *NULL을 제외한* 데이터의 개수를 반환한다. 이러한 특성 때문에 NULL을 제외한 개수를 파악하는 많은 문제에서 사용한다. `IS NULL`이나 `IFNULL` 등을 사용할 수도 있지만 `COUNT()`를 사용하는 것이 더 간결하기 때문이다.

`AVG()`는 주어진 컬럼의 평균값을 구한다. `WHERE` 조건절 혹은 `GROUP BY` 함수를 사용하면 소분류별 평균도 각각 구할 수 있다. `MIN()`과 `MAX()`는 각각 주어진 컬럼의 최소 혹은 최대값을 돌려준다. 


## GROUP BY
```sql
SELECT 컬럼명1, 컬럼명2          -- all columns to show must be included in group by phrase
     , COUNT(*), COUNT(1)       -- * to count all data, 1 to count non-null data
     , SUM(컬럼명1)              -- grouped sum
     , AVG(컬럼명1)              -- grouped mean
  FROM 원본테이블명
 GROUP BY 컬럼명1, 컬럼명2        -- choose appropriate level for analysis
```
`GROUP BY` 명령을 사용하면 데이터를 소그룹 별로 확인할 수 있다. 집계 함수를 사용하여 각 소그룹 별 건수(`COUNT`)나 합계(`SUM`), 평균(`AVG`) 등을 주로 구한다. 이 외에 다른 집계 함수도 모두 사용할 수 있다. 

`SELECT`절에서 확인하고 싶은 모든 컬럼은 `GROUP BY`절에 명시해야 한다. 두 개 이상의 소그룹으로 묶어서 집계하는 것도 가능하다. 예를 들어 성별, 연령별 방문객 수를 집계할 수 있다.


## HAVING
```sql
SELECT 직업, COUNT(*)
  FROM 원본테이블명
 GROUP BY 직업
HAVING COUNT(*) > 2
   AND AVG(연봉) > 500
```
`HAVING`은 `GROUP BY` 결과를 필터링할 수 있게 해준다. `WHERE`는 `GROUP BY` 연산이 일어나기 전에 필터링을 한다면 `HAVING`은 연산 후 결과를 필터링한다. 위 쿼리는 원본테이블에서 평균 연봉이 500보다 크며 해당 인원이 2명보다 많은 직업군을 출력한다. `GROUP BY`한 결과 테이블을 별도로 저장한 뒤 `WHERE`절을 사용하는 것과 동일한 효과를 갖는다. 
