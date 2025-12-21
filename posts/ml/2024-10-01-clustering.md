---
layout: post
category: ML
tags: ['data science']
date: 2024-10-01

author: Akai Red
title: Clustering Analysis
description:
    대표적인 비지도 학습인 군집분석에 대해 알아보자.

show_thumbnail: true
image: 
    # /imgs/a8ea569119cdcf31393e7bc671718519091f26722aa11f3ac297b186bd5e98cb.png
optimized_image: 
    # /imgs/a8ea569119cdcf31393e7bc671718519091f26722aa11f3ac297b186bd5e98cb.png
                    
math: true
published: true
---

## Clustering Analysis
```python
from sklearn.datasets import make_moons

# Sample data
X, y = make_moons(n_samples=100, 
                  noise=0.05, random_state=0)

sns.scatterplot(x=X[:,0], y=X[:,1], hue=y)
plt.show()
```

![picture 0](/imgs/a3dd645765efb88ffcece9655e708887b79a4e8d893de7848b33330f27cc5513.png)  

**군집 분석*Clustering Analysis***이란 학습 레이블이 없는 데이터를 N개의 클러스터로 묶어내는 기법을 말한다. 분류*Classification*와 유사하지만 분류는 지도학습이고 군집분석은 비지도학습이라는 차이점이 있다. 군집분석은 크게 계층적 군집분석과 비계층적 군집분석으로 나뉜다. 주요 기법으로 k-Mean, DBSCAN 등이 있다. 

군집분석을 실제로 사용해보면 항상 원하는 결과가 나오지는 않는다. 정답이 없는 비지도 학습의 특성상 분류한 군집이 내가 원하는 기준이 아닐 수 있다. 이러한 특성과 한계를 이해하고 적절한 방법을 선택하는 것이 중요하다.


## Non-Hierarchical Clustering
### 1. Prototype-based Clustering (k-Mean)
```python
from sklearn.cluster import KMeans

fig, axes = plt.subplots(nrows=1, ncols=2, figsize=(12,5))

kmeans = KMeans(n_clusters=2)
y_kmeans = kmeans.fit_predict(X)

sns.scatterplot(x=X[:,0], y=X[:,1], hue=y_kmeans, ax=axes[0])
sns.scatterplot(x=kmeans.cluster_centers_[:,0],
                y=kmeans.cluster_centers_[:,1],
                marker='+', s=300, linewidth=3, hue=[0,1],
                legend=False, ax=axes[0])
axes[0].set_title('Prototype-base (k-Mean)')
```

**프로토타입 기반 군집화*Prototype-based Clustering***은 데이터 포인트를 대표하는 프로토타입을 찾아 군집을 형성하는 방식이다. k-Mean은 대표적인 프로토타입 기반 군집화 방법이다. k-Mean은 데이터 포인트를 가장 가까운 중심점으로 할당하고 중심점을 업데이트하는 과정을 반복한다. 

k-Mean 방식은 이해하기 쉽지만 클러스터 수를 사전에 지정해야 하며, 초기 중심점을 랜덤하게 설정하기 때문에 결과가 변동적이다. 또한 클러스터의 모양이 원형이어야 한다는 가정이 있다.

`scikit-learn`에서는 `KMeans`를 사용해 k-Mean 군집화를 수행할 수 있다. `n_clusters` 파라미터로 군집 수를 지정할 수 있으며, `cluster_centers_` 속성으로 중심점을 확인할 수 있다. 

### 2. Density-based Clustering (DBSCAN)
```python
from sklearn.cluster import DBSCAN

dbscan = DBSCAN(eps=0.25, min_samples=5, metric='euclidean')
y_dbscan = dbscan.fit_predict(X)

sns.scatterplot(x=X[:,0], y=X[:,1], hue=y_dbscan, ax=axes[1])
axes[1].set_title('Dense-based (DBSCAN)')

plt.suptitle('Non-Hierarchical Clustering Analysis', fontsize=16)
plt.tight_layout()
plt.show()
```

**밀도 기반 군집화*Density-based Clustering***은 데이터 포인트의 밀도를 기준으로 군집을 형성하는 방식이다. DBSCAN은 대표적인 밀도 기반 군집화 방법이다. DBSCAN은 데이터 포인트 주변에 주어진 반지름(eps) 내에 최소 데이터 개수(min_samples) 이상이 있으면 군집을 형성한다. DBSCAN은 클러스터의 모양에 구애받지 않으며 이상치를 구분할 수 있는 장점이 있다.

![picture 1](/imgs/3b45f3d64a6ed80a76463fac569e0cb5d84b374e87c3d898296ee682259a4756.png)  


## Hierarchical Clustering

계층적 군집은 데이터 간의 유사성에 따라 계층 구조를 형성하면서 군집을 만든다. 클러스터 수를 사전에 정의할 필요가 없으며 데이터 간의 상관관계를 덴드로그램으로 시각화할 수 있는 것이 장점이다.


### 3. Agglomerative Clustering
```python
fig, axes = plt.subplots(nrows=2, ncols=1, figsize=(12,8))

# 3-1. Agglomerative Clustering
from sklearn.cluster import AgglomerativeClustering

agg = AgglomerativeClustering(n_clusters=None,
                              distance_threshold=0.2,
                              metric='euclidean',
                              linkage='single')
y_agg = agg.fit_predict(X)

sns.scatterplot(x=X[:,0], y=X[:,1], hue=y_agg, ax=axes[0])
axes[0].set_title('Agglomerative Clustering')

# 3-2. Dendrogram
from scipy.cluster.hierarchy import linkage, dendrogram, fcluster

single = linkage(X, metric='euclidean', method='single') # single, complete, average, ward, centroid
y_single = fcluster(single, t=0.2, criterion='distance')

dendrogram(single,
           distance_sort='ascending',
           color_threshold=0.2,
           ax=axes[1])
axes[1].set_title('Dendrogram')

plt.suptitle('Hierarchical Clustering Analysis', fontsize=16)
plt.tight_layout()
plt.show()
```

**병합적 계층적 군집*Agglomerative Clustering***은 각 데이터 포인트를 개별 클러스터로 시작해 가장 유사한 클러스터끼리 병합하는 방식이다. 병합 방식은 single, complete, average, ward, centroid 등이 있다. 위의 예시는 single linkage 방식으로 유클리디안 거리가 0.2 이하인 데이터를 병합한다. 병합된 클러스터는 다음 단계에서 다시 병합 대상이 된다.

`scikit-learn`에서는 `AgglomerativeClustering`을 사용해 병합적 계층적 군집을 수행할 수 있다. `n_clusters` 파라미터로 직접 원하는 군집수를 설정할 수 있으며, `n_clusters`를 지정하지 않으면 `distance_threshold`를 사용해 클러스터 수를 결정할 수 있다. 또한 `linkage`를 사용해 병합 방식을 지정할 수 있다. `scipy`에서는 `linkage`와 `dendrogram`을 사용해 덴드로그램을 그릴 수 있다.

![picture 4](/imgs/d712d670f6a401ec52b537026a3d6058aa2c81000401be5fa5d067d45c43489d.png)  

### 4. Divisive Clustering

**분할적 계층적 군집*Divisive Clustering***: 전체 데이터를 하나의 클러스터로 시작해 반복적으로 데이터를 분할하여 군집을 형성한다. 병합적 계층적 군집과 반대로 데이터를 분할하는 방식이다. 데이터를 나누는 방식이므로 계산 비용이 매우 높아 현실에서 널리 사용되지는 않지만 계층적 군집의 반대 개념으로 이론적 의미를 가진다. 

파이썬에서 분할적 계층적 군집을 제공하는 라이브러리는 없다. `AgglomerativeClustering`을 사용해 직접 코드를 작성하고 반대로 적용해야 한다.

## Evaluation

비지도 학습은 '정답'이 존재하지 않는다. 하지만 군집화의 성능을 평가하기 위한 몇몇 지표가 존재한다. 대표적으로 엘보우 방법, 실루엣 계수, 랜드 지수, 상호 정보량 등이 있다.

### Elbow Method
```python
fig, axes = plt.subplots(nrows=1, ncols=2, figsize=(12,6))

## 4-1. Elbow Method
sse = []

for k in range(1, 11):
    kmeans = KMeans(n_clusters=k)
    kmeans.fit(X)
    sse.append(kmeans.inertia_)

axes[0].plot(sse, marker='o')
axes[0].set_title('Scree Plot')
```

최적의 군집 수 k를 구하기 위해 엘보우 방법을 사용할 수 있다. k-Means 알고리즘 등의 일부 군집분석 방법은 사전에 군집 개수 k를 설정해야 한다. k가 증가함에 따라 제곱오차합 SSE는 감소한다. 엘보우 방법은 SSE가 가장 극적으로 줄어드는 k의 값을 찾는다. Screeplot을 그리고 SSE가 가장 극적으로 감소하는 k를 찾는다.

### Silhouette Coefficient
```python

## 4-2. Silhouette Coefficient
from sklearn.metrics import silhouette_samples

silhouette_vals = silhouette_samples(X, y_kmeans, metric='euclidean')

y_ax_lower, y_ax_upper = 0, 0

for i, c in enumerate(np.unique(y_kmeans)):
    c_silhouette_vals = silhouette_vals[y_kmeans == c]
    c_silhouette_vals.sort()

    axes[1].barh(range(y_ax_lower, y_ax_lower+len(c_silhouette_vals)), 
                 c_silhouette_vals,
                 edgecolor=None, label=f'cluster {i}'
                )
    y_ax_lower += len(c_silhouette_vals)
    
axes[1].set_title('Silhouette Coefficients')

plt.suptitle('Clustering Evaluation', fontsize=16)
plt.legend()
plt.show()
```
**실루엣 계수*Silhouette Coefficient***는 군집화의 성능을 평가하는 지표로 개별 데이터 포인트의 군집 내 거리와 군집 간 거리를 이용해 계산한다. 실루엣 계수는 -1에서 1 사이의 값을 가지며 1에 가까울수록 근처의 군집과 멀리 떨어져 있음을 나타낸다. 아래와 같이 각 클러스터의 실루엣 계수가 비슷한 경우 군집화가 잘 되었다고 볼 수 있다.

![picture 3](/imgs/2d4df808fc1830cb0beadda8e4814d1eff481c4a037f7857c64a08d682867ae8.png)  


### Adjusted Rand Index, Mutual Information
랜드 지수*Rand Index*와 상호 정보량*Mutual Information*은 정답*groudtruth label*과 결과값*clustered label*의 일치 정도를 나타내는 지수다. 자주 사용되지 않는데 애초에 정답이 필요하다는 것이 군집화의 목적과 어긋난다. 정답 라벨이 있다면 분류 알고리즘이나 딥러닝을 사용하는 것이 훨씬 낫다. 

랜드 지수 및 상호 정보량에 관한 자세한 설명이 궁금하다면 [이 사이트](https://datascienceschool.net/03%20machine%20learning/16.01%20%EA%B5%B0%EC%A7%91%ED%99%94.html#id4)를 참고하길 바란다.

## References
* [군집화 - 데이터사이언스스쿨](https://datascienceschool.net/03%20machine%20learning/16.01%20%EA%B5%B0%EC%A7%91%ED%99%94.html#id4)