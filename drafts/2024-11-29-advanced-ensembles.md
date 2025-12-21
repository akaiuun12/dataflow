---
layout: post
category: DL
tags: ['data science']
date: 2024-11-29

title: Advanced Ensemble Models
author: Akai Red
description:
    XGBoost, LightGBM, Histogram-based Boosting 등을 알아보자.
image: 
optimized_image: 

show_thumbnail: true
math: true
published: true
---

기본적인 Boosting은 순차적 학습이므로 학습 시간이 오래 걸린다. 따라서 Bagging 기반의 RandomForest와는 달리 대규모 데이터 처리에 적합하지 않고, 병렬 처리도 어려웠다. 그러나 Boosting 기법의 발전으로 Boosting의 높은 정확도를 유지한 채 대규모 데이터 처리가 가능해졌다.

## Gradient Boosting

### LightGBM
[LightGBM documentation](https://lightgbm.readthedocs.io/en/stable/)

LightGBM은 Microsoft 사에서 개발한 GBM 모형이다. 이름에서 알 수 있듯이 가벼운 GBM 모형을 지향하는데, 성능을 유지하며 속도를 매우 빠르게 개선하였다.

LightGBM은 Histogram-based 학습을 사용하여 연속형 변수를 구간화하여 학습 속도와 메모리 사용량을 크게 줄였다. 이에 따라 매우 큰 데이터셋에서도 빠르게 학습이 가능해졌다.

```python
import lightgbm as lgb

# LightGBM 모델 학습
lgb_train = lgb.Dataset(X_train, label=y_train)
lgb_test = lgb.Dataset(X_test, label=y_test, reference=lgb_train)

params = {
    'objective': 'binary',
    'boosting_type': 'gbdt',
    'metric': 'binary_error',
    'learning_rate': 0.1,
    'num_leaves': 31,
    'verbose': -1
}

lgb_model = lgb.train(params, lgb_train, valid_sets=[lgb_test], early_stopping_rounds=10)

# 예측 및 평가
y_pred = (lgb_model.predict(X_test) > 0.5).astype(int)
print(f"LightGBM Accuracy: {accuracy_score(y_test, y_pred):.4f}")
```



### XGBoost

```python
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score

# XGBoost 모형 설정
model_xgb = XGBClassifier(learning_rate=0.1,
                          max_depth=6,
                          random_state=42)

# XGBoost 모델 학습
model_xgb.fit(X_train, y_train)

# 예측 및 평가
y_pred = model_xgb.predict(X_test)

print(f"XGBoost Accuracy: {accuracy_score(y_test, y_pred):.4f}")
```

## Histogram-based Gradient Boosting Classifier
히스토그램 기반 GBM이다. 도큐멘트 설명에 따르면 10,000개 이상의 데이터에서는 일반적인 GBM보다 나은 성능을 보인다. 

```python
from sklearn.ensemble import HistGradientBoostingClassifier

# Histogram-based Gradient Boosting Classification Tree
model_hgb = HistGradientBoostingClassifier(max_depth=None,
                                           max_iter=1000,
                                           max_features=0.5,        # version 1.4+
                                           learning_rate=0.05,
                                           verbose=True)
```