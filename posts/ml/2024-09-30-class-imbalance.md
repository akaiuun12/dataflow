---
layout: post
category: ML
tags: ['data science']
date: 2024-09-30

author: Akai Red
title: Class Imbalance Problem
description:
    오버샘플링 기법을 사용해 클래스 불균형 문제를 해결한다.

show_thumbnail: true
image: 
    /imgs/a8ea569119cdcf31393e7bc671718519091f26722aa11f3ac297b186bd5e98cb.png
optimized_image: 
    /imgs/a8ea569119cdcf31393e7bc671718519091f26722aa11f3ac297b186bd5e98cb.png
                    
math: true
published: true
---

## Class Imbalance
```python
from collections import Counter
from sklearn.datasets import make_classification

# Created imbalanced dataset
X, y = make_classification(n_samples=1000, n_features=2, n_informative=2, 
                           n_redundant=0, n_clusters_per_class=1, weights=[0.95], 
                           flip_y=0, random_state=42)

# Count Numpy Array
print(f'Original Dataset: {Counter(y)}') # Counter({0: 950, 1: 50})
print(f'Original Dataset: {pd.DataFrame(y).value_counts()}') # when using a DataFrame

# Visualization
plt.scatter(x=X[:,0], y=X[:,1], c=y, 
            cmap='coolwarm', edgecolors='k', alpha=0.5)
plt.title('Imbalanced Class Distribution')
plt.legend()
plt.show()
```

클래스 불균형*Class Imbalance* 문제는 결과 데이터의 클래스 비중이 맞지 않는 것을 말한다. 머신러닝 모형 학습 시 극단적인 클래스 불균형은 문제가 된다. 예를 들어 **1000개의 환자 데이터 중 음성 데이터가 995개, 양성 데이터가 5개**인 불균형한 데이터가 존재한다고 하자. 이런 극단적인 상황에서는 **주어진 데이터를 모두 A로 판정하는 머신러닝 모형의 정확도가 99.5퍼센트**나 되어버린다. 그러나 정확도가 높다고 모든 환자를 음성으로 판단하는 이런 모형을 사용하지는 않을 것이다.

![picture 5](/imgs/ff08d0fb84dca8c4c4509afeef725dafee5d8279d8d69df615318e64bd97eb20.png)  


## Oversampling
```python
from imblearn.over_sampling import RandomOverSampler

ros = RandomOverSampler(sampling_strategy='auto')
X_ros, y_ros = ros.fit_resample(X, y)

# Count Numpy Array
print(f'Random Oversampling Result: {Counter(y_ros)}') # Counter({0: 950, 1: 950})
print(f'Random Oversampling Result: {pd.DataFrame(y_ros).value_counts()}') # when using a DataFrame

# Visualization
plt.scatter(x=X_ros[:,0], y=X_ros[:,1], c=y_ros, 
            cmap='coolwarm', edgecolors='k', alpha=0.5)
plt.title('Random Oversampling Result')
plt.show()
```

**오버샘플링*Oversampling***은 클래스 불균형 문제를 해결하는 방법 중 하나로 소수 클래스*minority class* 데이터를 늘리는 기법을 말한다. **랜덤오버샘플링*Random Oversampling***은 오버샘플링 중 가장 단순한 방법으로 소수 클래스 데이터를 단순 복제하여 다수 클래스와 같은 사이즈로 만든다. 이러한 방식은 클래스 불균형 문제를 해결하기는 하지만 동일 데이터를 늘리기 때문에 과적합*Overfitting*의 위험이 있다. `imblearn` Python 패키지를 사용하여 오버샘플링을 해볼 수 있다.

![picture 4](/imgs/72fd011701c48a185bf62bf468c1d0b507aad20e8d18e761c12bfb96e72cd7b0.png)  


### SMOTE
```python
from imblearn.over_sampling import SMOTE

smote = SMOTE(sampling_strategy='minority')
X_smote, y_smote = smote.fit_resample(X, y)

# Count Numpy Array
print(f'SMOTE Result: {Counter(y_smote)}') # Counter({0: 950, 1: 950})
print(f'SMOTE Result: {pd.DataFrame(y_smote).value_counts()}') # when using a DataFrame

# Visualization
plt.scatter(x=X_smote[:,0], y=X_smote[:,1], c=y_smote, 
            cmap='coolwarm', edgecolors='k', alpha=0.5)
plt.title('SMOTE Result')
plt.show()
```
**SMOTE, *Synthetic Minority Over-sampling Technique***는 Synthetic이라는 단어가 말해주듯 소수 클래스의 새로운 데이터를 만든다. kNN 방식 등을 사용하여 합성 데이터를 만들기 때문에 단순히 데이터를 복제하는 랜덤오버샘플링보다 과적합의 위험이 적다.

![picture 3](/imgs/e39a69b1cd3863b379872b3c73a3966fefe5207088593bc871123848a95067a4.png)  


## Undersampling
```python
from imblearn.under_sampling import RandomUnderSampler

rus = RandomUnderSampler(sampling_strategy='auto')
X_rus, y_rus = rus.fit_resample(X, y)

# Count resulting class
print(f'Random Undersampling Result: {Counter(y_rus)}') # Counter({0: 50, 1: 50})
print(f'Random Undersampling Result: {pd.DataFrame(y_rus).value_counts()}') # when using a DataFrame

# Visualization
plt.scatter(x=X_rus[:,0], y=X_rus[:,1], c=y_rus, 
            cmap='coolwarm', edgecolors='k', alpha=0.5)
plt.title('Random Undersampling Result')
plt.show()
```

![picture 6](/imgs/d96636b9e934efe71eda52d2e689a7b65dec892dc77445ecd27501bc7e1b4a11.png)  

**언더샘플링*Oversampling***은 오버샘플링과는 반대로 다수 클래스*majority class* 데이터를 줄이는 기법이다.언더샘플링은 클래스 불균형 문제를 해결하기는 하지만 데이터가 줄어들어 모형 학습에 불리하므로 오버샘플링에 비해 그다지 사용되지 않는다.


## Comparison
```python
fig, axes = plt.subplots(nrows=2, ncols=2, figsize=(8, 6))

X_list = [X, X_rus, X_ros, X_smote]
y_list = [y, y_rus, y_ros, y_smote]
titles = ['Original', 'Random undersampling', 'Random oversampling', 'SMOTE']

for i in range(4):
    axes[i//2][i%2].scatter(X_list[i][:,0], X_list[i][:,1], 
                            c=y_list[i], cmap='coolwarm', 
                            edgecolors='k', alpha=0.5)
    axes[i//2][i%2].set_title(titles[i])

plt.tight_layout()
plt.show()
```

위에서 설명한 기법을 하나의 그림으로 나타내면 아래와 같다. Original 데이터의 클래스 불균형 문제를 해결하고자 Random undersampling은 다수 클래스를 줄였다. Random oversampling은 소수 클래스를 단순 복제하여 늘렸기 때문에 새로운 정보를 얻지 못하고 과적합 위험이 발생한다. 가장 좋은 방법은 SMOTE를 사용해서 소수 클래스와 유사한 데이터를 만들어내는 것이다. 

최근에는 딥러닝 기법의 발전에 힘입어 GAN 등을 사용해 클래스 불균형 문제를 해결하는 시도도 있는데, 합성 데이터의 활용도가 클래스 불균형 문제 해소 외에도 무궁무진하기 때문에 앞으로가 더 기대되는 분야이다.

![picture 8](/imgs/a8ea569119cdcf31393e7bc671718519091f26722aa11f3ac297b186bd5e98cb.png)  


## References
* [RandomUnderSampler — Version 0.12.3](https://imbalanced-learn.org/stable/references/generated/imblearn.under_sampling.RandomUnderSampler.html)
* [RandomOverSampler — Version 0.12.3](https://imbalanced-learn.org/stable/references/generated/imblearn.over_sampling.RandomOverSampler.html)
* [SMOTE — Version 0.12.3](https://imbalanced-learn.org/stable/references/generated/imblearn.over_sampling.SMOTE.html)
