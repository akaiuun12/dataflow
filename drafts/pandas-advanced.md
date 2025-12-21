---
layout: post
category: Python
tags: ['python']

author: Akai Red
title: Pandas Guide
description:
    pandas는 2차원 테이블 데이터를 다루는데 최적화된 라이브러리다. 많은 분석 및 시각화 라이브러리가 데이터프레임 형식을 지원한다.

show_thumbnail: true
image: 
    https://res.cloudinary.com/dhchweuhy/image/upload/c_fill,w_760,h_399,r_5,f_auto,q_auto/lrc/20201209_img7
optimized_image: 
    https://res.cloudinary.com/dhchweuhy/image/upload/c_fill,w_380,h_200,r_5,f_auto,q_auto/lrc/20201209_img7
                    
math: true
published: false
---

## 6. Summary Statistics
```python
# method 1
df.count(), df.mean(), df.sum(), df.std(), df.var(), df.min(), df.max()

# method 2
df.describe()
```
pandas는 데이터 집계를 위한 다양한 메서드를 제공한다. 개수, 평균, 합계, 표준편차, 분산, 최소값, 최대값 등을 간단하게 구할 수 있다. 또한 전체 데이터의 요약 통계를 `df.describe()` 메서드로 한 번에 확인하는 것도 가능하다.


## 7. String
```python
df.str.lower()
df.str.slice(start, stop)                                    
df.str.replace(pat=' ', repl='_', regex=False)  # regex=True to use regular expression
df.str.split(pat=' ', expand=True)                                  
df.str.pad(width=5, side='left', fillchar='0')  # 5자리 길이가 되도록 0을 값의 왼쪽에 추가
```
데이터프레임에 문자열로 된 컬럼이 존재할 경우 `df.str` 메서드를 사용해 Series 단위의 문자열 처리를 할 수 있다. 일반 문자열 처리와 동일한 방식이기 때문에 금방 익숙해질 수 있다. 정규표현식을 사용하는 것도 가능하다.


## 8. Query-like Actions
### 8.1 Group By
```python
df.groupby(by=['col1', 'col2']).sum()
df.groupby(by=['col1', 'col2']).count()
df.groupby(by=['col1', 'col2']).apply(lambda x: x**2)
```
`df.groupby()` 메서드를 사용하면 집단 별로 데이터를 집계해서 볼 수 있다. 집계 방법에 따라 사용하는 메서드가 다른데 `.sum()`이나 `.count()`를 대표적으로 사용한다. `.apply` 메서드와 `lambda` 함수를 조합하면 집단별 대표값을 직접 만들어 추출할 수도 있다.

### 8.2 JOIN
```python
df = pd.merge(df1, df2, how='left', left_on='id', right_on='id')
```
`pd.merge()`를 사용해서 SQL에서 사용하는 조인을 pandas로도 할 수 있다. 적절한 파라미터를 지정하는 것으로 조인 방법을 구분할 수 있는데, 위의 코드는 LEFT OUTER JOIN을 수행한다. 그 외에 `inner`, `outer`, `right`, `cross` 등을 사용할 수 있다.

> WARNING If both key columns contain rows where the key is a null value, those rows will be matched against each other. This is different from usual SQL join behaviour and can lead to unexpected results.

[공식 문서](https://pandas.pydata.org/docs/reference/api/pandas.merge.html)의 설명에 따르면 pandas를 사용한 조인은 SQL과 달리 NULL값도 조인 키로 인식한다. 적절한 조인을 위해서는 결측값 처리를 해줘야 한다.

## 9. Reshape
### 9-1. Pivot
```python
pivot()
pivot_table()
stack()
unstack()
melt()
wide_to_long()
```


## References
* [pandas.merge — pandas 2.2.2 documentation](https://pandas.pydata.org/docs/reference/api/pandas.merge.html)
