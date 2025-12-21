---
layout: post
category: Python
tags: ['data structure']
date: 2024-01-22
author: Akai Red
title: Stack and Queue
description:
    스택은 LIFO 방식으로, 큐는 FIFO 방식으로 데이터를 처리한다.
image: 
    https://res.cloudinary.com/dhchweuhy/image/upload/c_fill,w_760,h_399,r_5,f_auto,q_auto/lrc/20240131_img1.jpg
optimized_image: 
    https://res.cloudinary.com/dhchweuhy/image/upload/c_fill,w_380,h_200,r_5,f_auto,q_auto/lrc/20240131_img1.jpg
show_thumbnail: true
math: true
published: true
---

## Stack
스택은 LIFO*Last In, First Out* 방식으로 항목을 처리하는 리스트로 다음과 같은 규칙을 가진다.

- 데이터는 스택의 끝에만 삽입할 수 있다.
- 데이터는 스택의 끝에서만 삭제할 수 있다.
- 스택의 마지막 원소만 읽을 수 있다.


### Stack in Python
```python
stack = [3, 4, 5]

stack.append(6)     # [3, 4, 5, 6]
stack.append(7)     # [3, 4, 5, 6, 7]

stack.pop()         # 7
stack               # [3, 4, 5, 6]
stack.pop()         # 6
stack.pop()         # 5
stack               # [3, 4]
```
Python에는 Stack을 구현한 자료형이 따로 존재하지 않는다. 대신 List를 사용하면 간단하게 구현할 수 있다. [Python 공식 홈페이지](https://docs.python.org/3/tutorial/datastructures.html#using-lists-as-stacks)에서도 List를 사용해 Stack을 만드는 것을 권장하고 있다. Stack에 데이터 삽입은 `.append()`, 데이터 조회 및 삭제는 `.pop()`을 사용한다. 

보다 강력한 LIFO 규칙 제약을 걸고 싶다면 `queue.LifoQueue()`를 사용할 수 있다.


## Queue
큐*Queue*는 FIFO*First In, First Out* 방식으로 항목을 처리하는 리스트로 다음과 같은 규칙을 가진다.

- 데이터는 큐의 끝에만 삽입할 수 있다.
- 데이터는 큐의 앞에서만 삭제할 수 있다.
- 큐의 첫 번째 원소만 읽을 수 있다.


### Queue in Python
```python
from collections import deque

queue = deque(["Eric", "John", "Michael"])

queue.append("Terry")           # Terry arrives
queue.append("Graham")          # Graham arrives

queue.popleft()                 # The first to arrive(Eric) now leaves
queue.popleft()                 # The second to arrive(John) now leaves

queue                           # Remaining queue in order of arrival
```
Python에는 Queue를 구현한 자료형이 따로 존재하지 않는다. 물론 리스트를 사용하여 구현할 수 있지만 리스트의 첫 번째 원소를 삭제하는 `.pop(0)`은 O(N)의 시간복잡도를 가지기 때문에 비효율적이다.

대신 `collections` 모듈의 `deque`를 사용하면 Queue를 간단하게 구현할 수 있다. Queue에 데이터 삽입은 `.append()`, 데이터 조회 및 삭제는 `.popleft()`를 사용한다.


## References
* [Python 공식 홈페이지 - Using Lists as Stacks](https://docs.python.org/3/tutorial/datastructures.html#using-lists-as-stacks)
* [Python 공식 홈페이지 - Using Lists as Queues](https://docs.python.org/3/tutorial/datastructures.html#using-lists-as-queues)