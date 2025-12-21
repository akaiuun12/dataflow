---
layout: post
category: SQL
tags: ['sql']

date: 2024-07-30
author: Akai Red
title: FULL OUTER JOIN을 사용한 회원 유입/이탈 분석
description: 
    FULL OUTER JOIN, MINUS, EXISTS를 사용하고 성능을 비교해보자.

image: 
    https://res.cloudinary.com/dhchweuhy/image/upload/c_fill,w_760,h_399,r_5,f_auto,q_auto/lrc/20220301_img1
optimized_image: 
    https://res.cloudinary.com/dhchweuhy/image/upload/c_fill,w_380,h_200,r_5,f_auto,q_auto/lrc/20220301_img1

show_thumbnail: true
math: true
published: false
---


회사에서 전월 대비 당월 회원수 변화를 체크해야 한다. 회원수 변화 자체야 `SELECT COUNT(DISTINCT member_id) FROM members` 정도로 회원수 테이블을 확인하면 되지만 유입/이탈 분석을 해야 했다. 


## 1. FULL OUTER JOIN

| 전월 | 당월 |
| - | - |
|1||
|2|2|
|3|3|
||4|

FULL OUTER JOIN을 사용하면 위와 같이 전월/당월 회원에 대해 NULL값을 살리면서 테이블을 조인할 수 있다.단순히 많이 사용하는 JOIN 혹은 LEFT OUTER JOIN을 사용하면 유입/이탈 회원수를 놓칠 수 있기에 주의해야 한다.

```sql
WITH current_members AS (
    ...
), prev_members AS (
    ...
)
    SELECT member_id
      FROM current_members A
      FULL OUTER JOIN prev_members B
        ON A.member_id = B.member_id
     WHERE A.member_id IS NOT NULL
       AND B.member_id IS NULL   
;
```

실무에서는 FULL OUTER JOIN을 사용하는 경우가 드물다고 하지만 이렇게 쓰는 방법도 있다. 나는 추가로 CTE 형식을 사용해서 조인 테이블의 크기를 줄여 성능상 문제가 없도록 조정했다.

위의 쿼리는 중복 제거가 되어있지 않다. A, B 테이블의 `member_id`에 중복이 없다면 문제가 없지만 아니라면 쿼리의 변경이 필요하다. WITH절에서 사전에 중복을 제거하거나 `DISTINCT` 명령어를 사용할 수 있다.


## 2. MINUS, INTERSECT
```sql
-- 2024년 6월 유입 고객
SELECT member_id FROM current_members
 MINUS
SELECT member_id FROM prev_members
;
```
MINUS와 INTERSECT을 사용해도 비슷한 결과를 얻을 수 있다. 현재 회원 테이블에서 전월 회원 테이블을 빼주면(MINUS) 유입 회원을 구할 수 있다. 

그러나 UNION ALL을 제외한 SET 연산자는 Sort 연산을 발생시키기 때문에 성능상 문제가 생길 수 있다. 유입/유지/이탈 값을 한 번의 조회로 확인할 수 없는 문제도 있어서 이 방식은 사용하지 않았다.


## 3. EXISTS
```sql
SELECT member_id
  FROM current_members A
 WHERE NOT EXISTS (SELECT "DUMMY"
                     FROM prev_members B
                    WHERE A.member_id = B.member_id)
```
쿼리 조회 성능을 높이고 싶다면 EXISTS를 사용할 수 있다. EXISTS를 사용하면 MINUS를 사용할 때 발생하는 불필요한 Sort 연산이 발생하지 않는다. 


## Comparison  
| 쿼리 | 실행시간 |
|-|-|
| FULL OUTER JOIN | 7초 157 |
| MINUS | 16초 281 |
| EXISTS| 7초 780 |

현재 사용하는 작업 환경에서 각 방법의 성능을 비교해보았다. 일반적인 OLAP 상황에서는 OLTP 상황만큼 쿼리 조회 속도가 중요하지는 않지만 테이블이 커지고 조인이 복잡해질수록 OLAP 상황에서도 쿼리 튜닝의 중요성은 증가한다.

FULL OUTER JOIN이 가장 빠르게 조회가 되었다. 하지만 JOIN 설정에 따라 달라질 수 있을 것이다. FULL OUTER JOIN을 사용할 때는 실행계획을 확인하여 성능 문제가 없는지 확인하자. 논리적으로는 문제가 없지만 실무에서 사용할 수 없게 될 수 있다. 

EXISTS를 사용한 조회 방법도 FULL OUTER JOIN과 거의 차이가 나지 않았다. SET 연산자를 사용한 경우 유의미하게 조회 속도가 느렸다. SET은 항상 EXISTS로 변경할 수 있기 때문에 성능을 고려한다면 사용하지 않는 것이 좋다.

