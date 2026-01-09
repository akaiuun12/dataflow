---
title: Boosting Over Residuals for Linear Data
date: 2026-01-09
author: Akai Red
image: /imgs/2026-01-09-boosting-over-residuals-01.png
tags: ['machine learning', 'boosting over residuals', 'tabular data', 'regression', 'xgboost']
published: true
---

데이터가 강한 선형성을 지니고 있을 때, 캐글(Kaggle) 등 머신러닝 경진대회에서 상위권 스코어를 달성하기 위해 사용하는 기법 중 하나가 바로 **Boosting Over Residuals**이다.

Boosting Over Residuals는 선형 모형에 데이터를 적합한 뒤, 잔차에 대해서 XGBoost 등 복잡한 비선형 모형을 학습하는 것이다. 데이터의 강한 선형성은 선형 모델로 잡되, 선형 모형이 잡지 못하는 오류(잔차)는 강력한 비선형 모형으로 잡겠다는 것이다.

즉, 딥러닝에서 말하는 잔차 학습(Residual Learning)과 완전히 동일한 개념이다. 그러나 잔차 학습이라고 쓰면 모두 딥러닝과 헷갈릴 것 같아서 이 포스팅에서는 Boosting Over Residuals라고 부르도록 하겠다. 용어는 해당 기법을 정형 데이터에 적용한 캐글 포스트를 참고하였다.


## Boosting Over Residuals의 단계
Boosting Over Residuals의 논리는 매우 명쾌하다.

1.  **선형 모형 적합**: 먼저 단순한 선형 회귀(Linear Regression)나 Ridge, Lasso 모형을 사용하여 데이터를 적합시킨다. 이 과정에서 데이터의 굵직한 선형적 흐름을 잡아낸다.
2.  **잔차(Residual) 계산**: 실제 타겟 값($y$)에서 선형 모형의 예측값($\hat{y}_{linear}$)을 뺀 잔차($r = y - \hat{y}_{linear}$)를 구한다. 이 잔차는 선형 모형이 미처 잡아내지 못한 '복잡한 패턴'이나 '오류'를 담고 있다.
3.  **비선형 모형 학습**: **잔차(r)를 새로운 타겟**으로 하여 XGBoost나 Neural Network 같은 강력한 비선형 모형을 학습시킨다.
4.  **최종 예측**: 최종 예측값은 두 모형의 예측값을 더한 값이 된다.
    $$\hat{y}_{final} = \hat{y}_{linear} + \hat{y}_{residual\_nonlinear}$$

이렇게 하면 선형 모델이 큰 틀에서의 경향성을 책임지고, 비선형 모델은 그 세부적인 디테일(잔차)만 보정하는 역할을 수행하게 되어 전체적인 성능이 향상되는 경우가 많다.

![단순한 직선 혹은 곡선은 오히려 비선형 모형으로 표현하려면 어려울 수 있다.](imgs/2024-07-16-ensemble-comparison.png)


## Boosting Over Residuals의 구현
`scikit-learn`의 `LinearRegression`과 `xgboost`의 `XGBRegressor`를 사용하여 간단하게 구현할 수 있다. 

데이터를 먼저 `LinearRegression`로 적합시키고, `residuals`를 계산한 뒤, `residuals`를 타겟으로 비선형 모형을 학습시킨다. 마지막으로 선형 모형의 예측값`test_linear_pred$`과 비선형 모형의 예측값`test_residual_pred`을 더하여 최종 예측값을 얻는다.

```python
import numpy as np
from sklearn.linear_model import LinearRegression
from xgboost import XGBRegressor
from sklearn.metrics import mean_squared_error

# 1. 선형 모델 학습
lr_model = LinearRegression()
lr_model.fit(X_train, y_train)

# 2. 선형 모델의 예측값 및 잔차 계산
train_linear_pred = lr_model.predict(X_train)
residuals = y_train - train_linear_pred

# 3. 잔차를 타겟으로 비선형 모델(XGBoost) 학습
xgb_model = XGBRegressor(n_estimators=100, learning_rate=0.05)
xgb_model.fit(X_train, residuals)

# 4. 최종 예측 (선형 예측 + 잔차 예측)
test_linear_pred = lr_model.predict(X_test)
test_residual_pred = xgb_model.predict(X_test)

final_pred = test_linear_pred + test_residual_pred

print(f"RMSE: {np.sqrt(mean_squared_error(y_test, final_pred))}")
```


## Boosting Over Residuals의 효과 및 주의할 점

### 안정적인 베이스라인
선형 모델이 이미 데이터의 상당 부분을 설명해주기 때문에, 비선형 모델이 학습해야 할 대상(잔차)의 분산이 작아져 학습이 더 안정적으로 진행될 수 있다.

### 앙상블 효과
서로 다른 메커니즘을 가진 두 모델을 결합하는 형태이므로, 단일 모델을 사용하는 것보다 일반화 성능이 좋아지는 경향이 있다.

### 주의할 점
모든 데이터에서 효과적인 것은 아니며 데이터에 선형성이 부족하다면 오히려 불필요한 복잡도만 증가시킬 수 있다. 또한 선형 모형과 비선형 모형을 각각 학습할 때 데이터 누수(Data Leakage)가 발생할 수 있으므로 주의해야 한다.

![현재까지는 Boosting Over Residuals가 내 Submission 중 가장 좋은 성능을 보여줬다.](imgs/2026-01-09-boosting-over-residuals-02.png)  


## References
- [XGB Boosting Over Residuals - CV 0.05595 🎉 🥳 🥇](https://www.kaggle.com/competitions/playground-series-s5e10/discussion/610828)