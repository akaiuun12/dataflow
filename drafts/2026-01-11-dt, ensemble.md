---
title: Decision Tree
date: 2026-01-11
author: Akai Red
image: 
tags: ['decision tree']
published: false
---

# Classification using DT, Ensemble, RF

의사결정나무*Decision Tree*는 의사결정트리, 결정트리라고도 부르며 분류/회귀 문제에 자주 사용하는 머신러닝 기법이다. 특정 기준을 바탕으로 분할을 반복해서 데이터를 정확하게 분류하는 것을 목표로 한다.







```python
import numpy as np
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

plt.rc('axes', unicode_minus=False)

# 1. UCI ML Breast Cancer Wisconsin (Diagnostic) dataset
from sklearn.datasets import load_breast_cancer

cancer = load_breast_cancer()
X = cancer.data
y = cancer.target

print(X.shape)  # (569, 30)
print(y.shape)  # (569,)

# Train-Test Split
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(X, y, 
                                                    stratify=y, test_size=0.3, random_state=42)

print(X_train.shape, y_train.shape) # (398, 30) (398,)
print(X_test.shape, y_test.shape)   # (171, 30) (171,)
```

## Decision Tree

```python
from sklearn.tree import DecisionTreeClassifier

model_dt = DecisionTreeClassifier(max_depth=3, random_state=42)
model_dt.fit(X_train, y_train)
```

의사결정나무는 정보 이득이 최대화되는 방향으로 데이터를 나눠나가며 트리를 만들어 간다. 보다 복잡한 이론적 배경을 원하면 아래의 내용을 읽어보자. 실습 코드를 작성하는데는 필수적이지 않다.

**Impurity**   
불순도*Impurity*는 한 그룹 안에 섞여있는 서로 다른 클래스의 정도를 말한다. 그룹을 두 개로 분리했을 때, 각 그룹에 고양이와 개가 섞여 있다면 그룹의 불순도는 높다. 반면 한 그룹에는 고양이만, 다른 한 그룹에는 개만 있으면 불순도는 낮다.  
불순도를 측정하기 위해서는 지니 불순도*Gini Impurity*, 엔트로피*entropy* 등을 사용한다. 사이킷런에서는 지니 불순도를 기본값으로 사용하는데 `criterion` 파라미터를 사용하여 변경할 수 있다.

**Information Gain**  
정보 이득*Information Gain*은 데이터 분할이 얼마나 효과적인지를 나타내는 값으로 의사결정나무의 목적함수다. 자식 노드의 불순도가 낮아질수록 정보 이득은 커진다.  
한 번의 분할로 두 그룹으로 나누는 이진결정트리*binary decision tree*를 예로 들어보자. 이진결정트리의 정보이득 $IG(D_p,f)$은 다음과 같다.
$$
IG(D_p, f) = I(D_p) - {\cfrac{N_{left}}{N_{p}}}{I(D_{left})} - {\cfrac{N_{right}}{N_{p}}}{I(D_{right})} 
$$
즉, 부모 노드의 불순도 $I(D_p)$에서 자식 노드의 불순도 $I(D_{left}), I(D_{right})$ 를 뺀 값이다. 부모 노드의 불순도는 고정이므로 자식 노드의 불순도를 줄일 수록 정보 이득이 커진다.

**Pruning**  
의사결정나무는 과적합*Overfitting*에 취약하다. 과적합을 방지하기 위한 방법 중 하나로 가지치기*Pruning*을 사용한다. 가지치기는 트리의 최대 깊이를 설정함으로써 모형 복잡도를 낮추고 일반화 성능을 향상시킨다. 사이킷런을 사용해 의사결정나무를 만들 때 `max_depth` 파라미터를 사용하면 가지치기 정도를 지정해줄 수 있다.


## Ensemble
여러 개의 분류기를 결합해서 분류 정확도를 높이는 기법을 **앙상블*Ensemble* 기법**이라고 한다. 분류기는 일반적으로 의사결정나무를 사용하지만 `estimator` 파라미터를 사용하여 다른 모형을 사용할 수도 있다. *(scikit-learn 1.2 버전 이후로 base_estimator가 estimator로 변경되었다.)*

**Plurality Voting**    
다수결 투표*plurality Voting*는 앙상블 모형에서 최종 예측값을 결정할 때 주로 사용하는 방법이다. 간단하게 가장 많은 예측값(최빈값*mode*)을 대표 예측값으로 사용한다. 보다 복잡한 방법은 분류기별 가중치를 부여한다. 과반수 투표*majority voting*는 예측값 후보가 2개뿐인 다수결 투표의 특수한 경우라고 볼 수 있다.

### Bagging (Bootstrap Aggregating)

![결정트리, 배깅,부스팅 비교](https://quantdare.com/wp-content/uploads/2016/04/bb3.png)

```python
from sklearn.ensemble import BaggingClassifier

model_bag = BaggingClassifier(n_estimators=100,random_state=42)
model_bag.fit(X_train, y_train)
```

배깅은 부트스트랩 기법을 사용해서 여러 개의 분류기를 만든다. 원본 데이터에서 중복을 허용해서 n개의 분류기를 만드는 방법을 Bootstrap Aggregating 줄여서 흔히 배깅*Bagging*이라고 부른다. 


### Boosting
부스팅*Boosting*은 병렬적인 배깅과는 달리 순차적으로 여러 개의 분류기를 생성한다. 최초 단계에서 중복을 허용하지 않은 랜덤 샘플을 추출한다. 그 후 이전 단계의 학습에서 잘못 분류된 데이터에 높은 가중치를 주어 추출한다. 이전 단계의 잘못을 점점 바로잡아가는 방식이다. 최종적인 예측값은 각 분류기의 가중치를 바탕으로 선정한다.

#### AdaBoost
```python
from sklearn.ensemble import AdaBoostClassifier

model_ada = AdaBoostClassifier(n_estimators=100,random_state=42)
model_ada.fit(X_train, y_train)
```

부스팅 기법에는 여러가지가 있다. 다음은 가장 일반적인 부스팅 방법인 에이다부스트*AddBoost, Adaptive Boosting*을 구현하는 코드다. 에이다부스트 외에 XGBoost 등도 유명하다.

### Random Forest
랜덤포레스트*Random Forest*는 여러 개의 의사결정나무를 모은 앙상블 모형이다. 사실 랜덤포레스트는 개별 결정트리 학습 시 특성을 무작위로 선택하는 배깅의 특수한 사례다. 이를 통해 분류기 간 상관성을 줄이고 과적합 위험을 감소시킨다. 단일 의사결정나무보다 과적합에 강하지만 해석의 용이성은 다소 떨어진다.

<!-- 하이퍼파라미터 튜닝에 신경 쓸 필요가 적은 것도 랜덤포레스트의 장점이다. 랜덤포레스트에서는 가지치기가 필요없다. 현실적으로 랜덤포레스트의 최대 깊이 `max_depth`만을 설정한다. 한 번에 추출하는 부트스트랩의 크기 $n$이나 랜덤하게 선택하는 특성의 개수 $d$는 보통 기본값을 사용한다. -->

```python
from sklearn.ensemble import RandomForestClassifier

model_rf = RandomForestClassifier(n_estimators=100, random_state=42)
model_rf.fit(X_train, y_train)
```

## Model Comparison
### Metrics
```python
y_pred_dt = model_dt.predict(X_test)
y_pred_bag = model_bag.predict(X_test)
y_pred_ada = model_ada.predict(X_test)
y_pred_rf = model_rf.predict(X_test)

print(f'''
- Accuracy
    Decision Tree: {accuracy_score(y_test, y_pred_dt):.2f}
    Bagging: {accuracy_score(y_test, y_pred_bag):.2f}
    AdaBoost: {accuracy_score(y_test, y_pred_ada):.2f}
    Random Forest: {accuracy_score(y_test, y_pred_rf):.2f}

- Recall
    Decision Tree: {recall_score(y_test, y_pred_dt, average="macro"):.2f}
    Bagging: {recall_score(y_test, y_pred_bag, average="macro"):.2f}
    AdaBoost: {recall_score(y_test, y_pred_ada, average="macro"):.2f}
    Random Forest: {recall_score(y_test, y_pred_rf, average="macro"):.2f}

- Precision
    Decision Tree: {precision_score(y_test, y_pred_dt, average="macro"):.2f}
    Bagging: {precision_score(y_test, y_pred_bag, average="macro"):.2f}
    AdaBoost: {precision_score(y_test, y_pred_ada, average="macro"):.2f}
    Random Forest: {precision_score(y_test, y_pred_rf, average="macro"):.2f}

- F1 Score
    Decision Tree: {f1_score(y_test, y_pred_dt, average="macro"):.2f}
    Bagging: {f1_score(y_test, y_pred_bag, average="macro"):.2f}
    AdaBoost: {f1_score(y_test, y_pred_ada, average="macro"):.2f}
    Random Forest: {f1_score(y_test, y_pred_rf, average="macro"):.2f}
''')
```
[분류모형 평가지표]()를 바탕으로 모형을 비교해보면 랜덤포레스트 모형이 가장 좋은 성능을 보인다. 학습 데이터로 학습을 마친 DT, 배깅, 부스팅, RF 모형에 테스트 데이터를 넣어 예측값 `y_pred`를 구한다. `y_pred`를 `y_test`와 비교하여 얼마나 정확하게 분류하는지 확인한다. 대표적인 평가지표 정확도*Accuracy*, 재현율*Recall*, 정밀도*Precision*, F1 점수*F1 score*를 확인한 결과 부스팅 모형이 가장 좋은 성능을 보인다

## ROC Curve
```python
from sklearn.metrics import roc_curve, auc

# List of models and corresponding names
models = [model_dt, model_bag, model_ada, model_rf]
model_names = ['Decision Tree', 'Bagging', 'AdaBoost', 'Random Forest']

for model, name in zip(models, model_names):
    y_predict_proba = model.predict_proba(X_test)[:, 1]
    fpr, tpr, _ = roc_curve(y_test, y_predict_proba)
    roc_auc = auc(fpr, tpr)
    plt.plot(fpr, tpr, label=f'{name} (AUC = {roc_auc:.2f})')

plt.plot([0, 1], [0, 1], 'k--')
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.title('ROC Curve')
plt.legend(loc='lower right')
plt.show()
```
ROC Curve를 바탕으로 모형을 비교할 경우 모든 앙상블 모형이 비슷한 결과를 보인다.

![ROC Curve - DT, Bagging, Boosting, RF](/imgs/2024-07-16-ensemble-roc-curve.png)


# Regression using DT, Ensemble, RF

```python
# California Housing Data
from sklearn.datasets import fetch_california_housing
housing = fetch_california_housing()

X = housing.data
y = housing.target

# Train - Test Split
from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

print(X_train.shape, y_train.shape)
print(X_test.shape, y_test.shape)
```
의사결정나무 및 앙상블 모형을 사용해서 회귀 분석을 진행할 수도 있다. 방법은 분류 분석과 크게 다르지 않다. 

회귀 분석을 위한 데이터로 캘리포니아 부동산 가격 데이터를 사용하고, 데이터를 7:3의 비율로 분할한다. 30%의 데이터는 추후 테스트 데이터로 사용한다. 의사결정나무 기반 모형을 사용할 것이라 별도의 전처리는 따로 하지 않는다.


```python
# Regression using Ensemble Models
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import BaggingRegressor
from sklearn.ensemble import AdaBoostRegressor
from sklearn.ensemble import RandomForestRegressor

reg_model_dt = DecisionTreeRegressor(random_state=42)
reg_model_bag = BaggingRegressor(random_state=42)
reg_model_ada = AdaBoostRegressor(random_state=42)
reg_model_rf = RandomForestRegressor(random_state=42)

reg_model_dt.fit(X_train, y_train)
reg_model_bag.fit(X_train, y_train)
reg_model_ada.fit(X_train, y_train)
reg_model_rf.fit(X_train, y_train)
```

회귀모형은 `Regressor`로 끝나는 별도 패키지를 가져온다. 사용법 자체는 `Classifier`와 유사하여 모형을 생성하고 학습 데이터를 학습시킨다. 추후 예측치를 얻는 과정 및 함수도 동일하다.

<!-- ```python
import scipy.stats as stats

# Create sample data
rs = np.random.RandomState(42)
X = np.sort(5 * rs.rand(50,1))
y = np.sin(X).ravel()
y[::10] += rs.normal(0, 1, size=len(y[::10]))

plt.figure(figsize=(10,6))
x_axis = np.linspace(0, 5, 100).reshape(-1, 1)
plt.scatter(X, y, s=20)

# Model Comparison
vars = [1, 3, 100]

for var in vars:
    model = DecisionTreeRegressor(max_depth=var, random_state=42)
    model.fit(X, y)

    plt.plot(x_axis, model.predict(x_axis), linestyle='--', label=f'max_depth={var}')

plt.title('Decision Tree Regressor')
plt.xlabel('X')
plt.ylabel('y')
plt.legend()
plt.show()
``` -->

![](/imgs/2024-07-16-ensemble-comparison.png)

의사결정나무의 회귀 분석 학습도 분류 분석과 동일한 방법을 거친다. 다만 목적 함수에서 지니 불순도, 엔트로피가 아닌 MSE 등을 사용한다. 트리의 깊이가 너무 깊어지면 과적합이 발생하는 것 또한 동일하다.

위 그래프에서 트리 모형과 데이터 사이의 오차를 최적화하는 방식을 확인할 수 있다. 목적함수를 최소화할 수 있는 구간을 잡고, 구간의 평균값을 회귀 예측의 결과값으로 사용한다.


```python
from sklearn.metrics import mean_squared_error, r2_score

y_pred_dt = reg_model_dt.predict(X_test)
y_pred_bag = reg_model_bag.predict(X_test)
y_pred_ada = reg_model_ada.predict(X_test)
y_pred_rf = reg_model_rf.predict(X_test)

print(f'''
- MSE
    Decision Tree: {mean_squared_error(y_test, y_pred_dt):.2f}
    Bagging: {mean_squared_error(y_test, y_pred_bag):.2f}
    AdaBoost: {mean_squared_error(y_test, y_pred_ada):.2f}
    Random Forest: {mean_squared_error(y_test, y_pred_rf):.2f}

- R2 Score
    Decision Tree: {r2_score(y_test, y_pred_dt):.2f}
    Bagging: {r2_score(y_test, y_pred_bag):.2f}
    AdaBoost: {r2_score(y_test, y_pred_ada):.2f}
    Random Forest: {r2_score(y_test, y_pred_rf):.2f}
''')
```
회귀 모형의 성능 평가를 위해서는 MSE, R-squared 점수 등을 사용한다. 분류 모형의 성능 평가 시와는 다른 지표를 사용해야 한다. MSE, R-squared 점수를 확인한 결과 랜덤포레스트 모형이 가장 좋은 성능을 보였다.


```python
fig, axes = plt.subplots(2, 2, figsize=(8, 8))

# 모델 이름과 예측값을 리스트로 저장
vars = [('Decision Tree', y_pred_dt),
        ('Bagging', y_pred_bag),
        ('AdaBoost', y_pred_ada),
        ('Random Forest', y_pred_rf)]

for i, (name, y_pred) in enumerate(vars):
    row, col = divmod(i, 2)
    axes[row, col].scatter(y_test, y_pred, alpha=0.3)
    axes[row, col].set_title(name)
    axes[row, col].set_xlabel('Actual')
    axes[row, col].set_ylabel('Predicted')
    axes[row, col].plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'k--')

plt.tight_layout()
plt.show()
```
![회귀분석 - 모형 비교](/imgs/2024-07-16-ensemble-regression.png)

테스트 데이터와의 비교를 통해 모형 성능을 시각화할 수 있다. 랜덤포레스트 혹은 배깅이 MSE, R-squared 점수로 확인한 것처럼 가장 좋은 성능을 보이는 것을 알 수 있다.

AdaBoost의 경우 Shrinkage가 일어나 모형 성능이 가장 좋지 않다. Decision Tree의 경우 이상치의 영향을 많이 받았다. 원본 데이터 자체가 5가 넘는 주택 가격은 모두 5로 입력한 것으로 보인다.

## References
- [What is the difference between Bagging and Boosting?](https://quantdare.com/what-is-the-difference-between-bagging-and-boosting/)
