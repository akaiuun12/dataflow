---
layout: post
category: Python
tags: ['python']
date: 2021-03-30

title: 파이썬을 사용한 자동화 (os, sys, shutil)
author: Akai Red
description:
    os, sys, shutil 등은 파이썬 기반 자동화 작업 시 중요한 패키지다.
image:
    https://res.cloudinary.com/dhchweuhy/image/upload/c_fill,w_760,h_399,r_5,f_auto,q_auto/lrc/20220211_img1
optimized_image:
    https://res.cloudinary.com/dhchweuhy/image/upload/c_fill,w_380,h_200,r_5,f_auto,q_auto/lrc/20220211_img1

show_thumbnail: true
math: true
published: true
---

## sys
`sys`는 시스템과 관련된 다양한 기능을 제공한다.

### sys.version: Python 버전 확인
```python
import sys
sys.version   # '3.6.10 (default, Jul 23 2020, ...)'
```
`sys.version`은 Python 스크립트 내에서 Python 버전을 확인할 수 있게 해준다. 버전 충돌로 인한 오류가 발생할 경우 확인해보자. 자신의 분석 보고서에 `sys.version`로 사용한 Python 버전을 명시해주는 것도 재현성을 높이는데 도움이 된다.

### sys.path
```python
sys.path      # check Python environment path
``` 
`sys.path`는 Python이 패키지 및 모듈을 불러오는 경로를 관리한다. `sys.path`에는 스크립트 파일의 절대경로 및 `PYTHONPATH`에 있는 경로 등이 들어있다. Python에서 함수를 호출하면 `sys.path`에 있는 주소를 확인하며, 불러오고자 하는 함수가 없으면 오류가 발생한다. 

`sys.path`는 리스트 자료형이기 때문에 `sys.path.append(PATH)`로 원하는 경로를 추가할 수도 있다. 다만 전체 Python 환경 설정에 영향을 주기 때문에 조심해서 사용해야 한다. 

`sys.path`에는 우선 순위가 있다. 우선 순위 경로에서 함수를 찾을 경우 해당 함수를 사용한다.


## os
<!-- ### os.system('운영체제 명령어')
```python
import os
os.system()
``` -->

### os.getcwd(), os.chdir: 작업경로 설정
```python
os.getcwd()
os.chdir('User/Downloads')
```
작업경로 설정은 로컬 환경에서는 쓸 일이 많지 않지만 Colab, Kaggle 같은 클라우드 기반 환경에서는 종종 사용한다.

`os.getcwd()`로 현재 작업경로를 확인한다. 변경하고 싶다면 `os.chdir(PATH)`에 변경하고 싶은 경로를 넣어주면 된다.

### os.path: 경로 확인
```python
os.path.exists(PATH)
os.path.isfile(PATH)
os.path.isdir(PATH)

# save to csv, only if file doesn't exist. 
if os.path.isfile(PATH): 
    print('File already exists')
else: 
    df.to_csv('PATH')
```
`os.path`를 사용하면 경로와 관련된 다양한 기능을 사용할 수 있다. 파일 혹은 폴더가 존재할 경우 (혹은 존재하지 않을 경우) 발생할 수 있는 오류를 사전에 방지할 수 있다.

`os.path.exists(PATH)`은 `PATH`가 존재하면 `True`, 아니면 `False`를 반환한다. `os.path.isfile(PATH)`, `os.path.isdir(PATH)`은 각각 `PATH`가 파일인지 폴더인지 확인하여 `True` 혹은 `False`를 반환한다. 

### os.remove(), os.rmdir(): 파일, 폴더 삭제하기
```python
# Remove file or folder if exists.
if os.path.isfile(PATH):
  os.remove(PATH)
elif os.path.isdir(PATH):
  os.rmdir(PATH)
else:
  print('File or folder does not exists.')
```
`os.remove(PATH)`와 `os.rmdir(PATH)`은 각각 해당 경로에 있는 파일 혹은 폴더를 삭제한다. 위의 `os.path.isfile()`, `os.path.isdir()`과 함께 사용하면 기존에 파일이 존재할 경우 삭제하는 코드를 작성할 수 있다.

### os.listdir(): 특정 폴더의 모든 파일명 구하기
```python
files = os.listdir('Downloads')
movies = [x for x in files if x.endswith('.mp4')]
```

`os.listdir()`를 사용하면 원하는 경로의 모든 파일명을 얻을 수 있다. 결과값은 문자열 리스트로 반환된다. 그냥 사용해도 되지만 이 함수는 숨김 파일도 다 불러오기 때문에 확인하지 않고 사용했다가는 나중에 오류가 발생할 수 있다. 그래서 보통 확장자나 이름을 사용해서 조건을 명시하고 원하는 파일만 골라서 사용한다.

### os.rename(기존경로, 새경로): 파일, 폴더 이동 혹은 이름 변경
```python
for movie in movies:
  os.rename(f'Downloads/{movie}', f'Movie/new_{movie}')
```

`os.rename(src, dst)`은 이름에서 알 수 있듯이 파일의 이름을 변경하는 함수다. 그러나 두 가지 중요한 포인트가 있다. 첫 번째, 이 함수는 `os.remove`, `os.rmdir`가 나눠져 있는 것과는 달리 파일과 폴더에 다 사용할 수 있다. 두 번째, 파일과 폴더의 이름 변경을 통해 이동이 가능하다. 예를 들어 위처럼 `Downloads`폴더의 파일을 `Movies` 폴더로 이동할 수 있다. 같은 경로로 지정하면 이름만 변경되고, 다른 경로로 지정하면 이동되는 원리다.


## shutil
### shutil.move(기존경로, 새경로) : 파일 이동
```python
for movie in movies:
  shutil.move(f'Downloads/{movie}', f'Movie/{movie}')
```
`os.rename()`이 동작하지 않으면 `shutil.move()`를 써보자. 사용법은 `os.rename()`을 써서 파일을 이동할 때와 똑같다. 

### shutil.copy(기존경로, 새경로): 파일 복사
```python
for movie in movies:
  shutil.copy(f'Downloads/{movie}', f'Movie/{movie}')
```
`shutil.copy()`를 사용하면 파일 이동이 아니라 파일 복사를 할 수 있다. 위의 코드는 파일을 Downloads 폴더에서 Movie 폴더로 복사한다.

## References
* [sys.path, PYTHONPATH: 파이썬 파일 탐색 경로](https://www.bangseongbeom.com/sys-path-pythonpath.html#fn:input-script)
