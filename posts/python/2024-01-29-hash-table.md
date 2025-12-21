---
layout: post
category: Python
tags: ['data structure']
date: 2024-01-29
author: Akai Red
title: Hash Function and Hash Table
description:
    해시 테이블은 해시 함수를 사용해 데이터를 저장하고 조회한다.
image: 
    https://res.cloudinary.com/dhchweuhy/image/upload/c_fill,w_760,h_399,r_5,f_auto,q_auto/lrc/20240129_img1
optimized_image: 
    https://res.cloudinary.com/dhchweuhy/image/upload/c_fill,w_380,h_200,r_5,f_auto,q_auto/lrc/20240129_img1
show_thumbnail: true
math: true
published: true
---

<!-- 
## Hash Function

## Hash Table -->

## Hash Table in Python: Dictionary
```python
# create an empty hash table
hash_table = {}
hash_table = dict()

# insert new data in O(1)
hash_table[key] = value

# dicitonary properties
hash_table.keys()   # get keys
hash_table.values() # get values
hash_table.items()  # get key-value pairs
```
파이썬에서 해시 테이블은 딕셔너리 자료형으로 구현되어 있다. `dict()` 혹은 `{}`로 딕셔너리를 생성할 수 있다. `{}`에 키-값 쌍을 넣으면 딕셔너리가 되고 한 가지 값만 넣으면 집합*set*이 된다. 보통 `{}`는 딕셔너리를 표현하고 사용빈도가 낮은 집합은 `set()`으로 생성한다.

해시 테이블(딕셔너리)의 키, 값, 키-값 쌍은 각각 `dict.keys(), dict.values(), dict.items()` 메서드로 구할 수 있다. 딕셔너리의 자료는 기본적으로 정렬되지 않은 상태이기 때문에 위의 메서드로 키, 값을 불러온다면 별도로 정렬해줄 필요가 있다.

### O(1) Lookup using Hash Table
```python
# list of length N
array = [12, 4, 672, 45, 78, 8, 23] 

# O(N) Lookup
if 45 in array:
    print(True)         

# create hash table from an array
hash_table = {}
for num in array:
    hash_table[num] = True

# O(1) Lookup
print(hash_table.get(45))   # True if 45 exists, None if doesn't exits
```
해시 테이블은 쌍으로 된 자료를 다룰 때 외에도 조회 속도를 높이기 위해서도 사용한다. 약간의 트릭으로 배열을 해시 테이블로 바꾸면 룩업의 계산 복잡도가 O(N)에서 O(1)로 빨라진다. 알고리즘의 효율성이 떨어진다면 해시 테이블을 인덱스로 사용해보라.

크기 N인 배열을 해시 테이블로 생성하는데는 O(N)의 계산 복잡도가 여전히 필요하며 경우에 따라서는 더 필요할 수도 있다. (예를 들어 중복된 키가 존재하여 값이 충돌할 경우가 그렇다.) 하지만 많은 컴퓨터 언어에서 해시 테이블 생성 최적화를 이미 해놓았기 때문에 크게 중요한 요소는 아니다. 간단한 수준에서는 해시테이블의 O(1)의 조회 성능이 훨씬 유리한 경우가 많다.


### Check Existing Keys
```python
# avoid overwriting with following methods

# method 1
if hash_table.get(key):
    print('Key already exists in hash table')
else:
    print('Key given does not exist in hash table')
    
# method 2
if key in hash_table.keys():
    print('Key already exists in hash table')
else:
    print('Key given does not exist in hash table')
```
딕셔너리의 키는 유일해야 하며, 같은 키가 입력될 경우 나중에 입력한 값으로 덮어쓴다. 반면 딕셔너리에 존재하지 않는 키를 그냥 사용하면 오류가 발생한다. 그래서 딕셔너리를 사용할 때는 키가 이미 존재하는지 확인하는 작업이 중요하다.

`dict.get(key)`는 주어진 키가 딕셔너리에 있으면 그 값을 반환하고 없으면 `None`을 반환한다. 이를 사용해 존재하지 않는 키 오류를 회피할 수 있다. `in dict.keys()`를 사용해도 비슷한 효과를 얻을 수 있다. 하지만 반환한 키 리스트에서 한 번 더 검색해야 하기 때문에 느리다.


### Sort Dictionary Items
```python
# Sort dictionary pairs by values
sorted_table = sorted(hash_table.items(), key=lambda x: x[1]) # by values
sorted_table = sorted(hash_table.items(), key=lambda x: x[0]) # by keys

# Sort Dictionary Keys
sorted_keys = sorted(hash_table.keys())   # in list comprehension

# Sort Dictionary Values
sorted_values = sorted(hash_table.values(), reverse=True)   # descending
```
**값을 기준으로 키,값 쌍을 정렬**하고자 하는 경우가 종종 있는데 이 때는 `sorted()`를 써야한다. 반대의 경우도 가능하지만 해시 테이블의 조회는 기본적으로 매우 빠르기 때문에 정렬된 키 리스트를 사용하는 것에 비해 큰 메리트가 없다.

딕셔너리 키나 값을 정렬하고 싶을 때는 일단 리스트로 변환한 다음 정렬한다. 딕셔너리 자체도 `sorted()` 함수를 지원하지만, `dict.keys()`, `dict.values()`가 각각 키와 값을 리스트로 반환하기 때문에 리스트로 변환한 뒤 정렬하는 것이 훨씬 간편하다.


## References
* [누구나 자료 구조와 알고리즘 - 제이 웬그로우](https://thebook.io/080274/)
* [처음 시작하는 파이썬 - 빌 루바노빅](https://m.hanbit.co.kr/store/books/book_view.html?p_code=B4872223435)