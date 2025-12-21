---
layout: post
category: DL
tags: ['deep learning']
date: 2025-09-13

title: Vanishing and Exploding Gradients
author: Akai Red
description:
    심층 신경망에서는 그래디언트(기울기)를 사용해서 가중치를 업데이트하고 모델을 학습시킨다. 모델 학습을 방해하는 그래디언트 소실/폭주 문제를 알아보고 주요 해결책을 확인한다.
image: 
optimized_image: 

show_thumbnail: true
math: true
published: true
---

## Vanishing/Exploding Gradients
기울기 소실/폭주 문제는 심층 신경망의 역전파 과정에서 기울기(gradient)가 점점 작아지거나 커져서 가중치가 제대로 업데이트되지 않는 문제를 말한다. 기울기 소실 문제는 신경망의 깊이가 깊어질수록 발생할 가능성이 높아진다. 


## Weight Initialization
신경망의 가중치는 전부 0으로 (혹은 전부 동일한 값으로) 초기화하면 안된다. 이럴 경우 모든 뉴런이 동일한 결과값을 출력하게 된다. 기울기 소실은 신경망의 깊이가 깊어짐에 따라 역전파가 제대로 이루어지지 않고, 레이어의 가중치가 0으로 수렴하여 학습이 제대로 이루어 지지 않는 현상을 말한다.  
기울기 소실을 막기 위해서는 가중치는 무작위의 작은 값으로 초기화하는 것이 좋다. 기울기 소실 문제를 해결하고 학습 속도를 높이기 위한 다양한 가중치 초기화 방법이 연구되었다. 대표적인 방법으로는 Glorot/Xavier 초기화와 He 초기화가 있다.


### Glorot / Xavier Initialization (keras default)
```python
import tensorflow as tf

dense = tf.keras.layers.Dense(
    activation='tanh',
    kernel_initializer='glorot_uniform' # or 'glorot_normal'
)
```

Glorot 초기화는 Xavier Glorot과 Yoshua Bengio가 제안한 초기화 방법으로 주로 tanh, logistic (sigmoid), softmax 활성화 함수와 함께 사용된다. Xavier 초기화라고도 불린다.

$$
\begin{aligned}

&\textbf{Glorot Normal:} \quad 
W \sim \mathcal{N}\!\left(0, \; \frac{2}{fan_{in} + fan_{out}}\right) \\[6pt]

&\textbf{Glorot Uniform:} \quad 
W \sim \mathcal{U}\!\left(-\sqrt{\tfrac{6}{fan_{in} + fan_{out}}}, \; \sqrt{\tfrac{6}{fan_{in} + fan_{out}}}\right) \\[10pt]

& fan_{in} = \text{number of input neurons.} \\[6pt]
& fan_{out} = \text{number of output neurons.}

\end{aligned}
$$


### He Initialization
```python
import tensorflow as tf

dense = tf.keras.layers.Dense(
    activation='relu',
    kernel_initializer='he_uniform' # or 'he_normal'
)
```

He 초기화는 Kaiming He가 제안한 초기화 방법으로 주로 ReLU 및 그 변형 활성화 함수와 함께 사용된다. ReLU 계열의 활성화 함수는 음수 영역에서 기울기가 0이 되기 때문에, Glorot 초기화보다 He 초기화를 사용하는 것이 더 적합하다.

$$
\begin{aligned}

&\textbf{He Normal:} \quad 
W \sim \mathcal{N}\!\left(0, \; \frac{2}{fan_{in}}\right) \\[6pt]

&\textbf{He Uniform:} \quad 
W \sim \mathcal{U}\!\left(-\sqrt{\tfrac{6}{fan_{in}}}, \; \sqrt{\tfrac{6}{fan_{in}}}\right) \\[10pt]

& fan_{in} = \text{number of input neurons.}
\end{aligned}
$$

- ReLU  
ReLU 함수는 기존에 사용하던 시그모이드 함수와 다르게 극단적 양 끝값에서 기울기가 0으로 수렴하지 않는다. 따라서 기울기 소실 문제가 덜 발생한다.단순한 구조로 인해 미분 역전파 계산 시 속도도 매우 빠르다. 입력값이 음수이면 0, 양수이면 입력값이 그대로 기울기가 된다. 

- LeakyReLU  
입력값이 0보다 작을 경우 ReLU의 기울기는 0이 되어 죽은 ReLU가 되는 문제점이 있다. LeakyReLU는 음수 입력값의 경우에도 완만한 기울기를 줘서 ReLU가 죽지 않도록 한다. LeakyReLU는 대부분의 경우 ReLU보다 나은 성능을 보인다고 한다(Bing Xu et al., 2015).

<!-- 
- RReLU, PReLU
- ELU, SELU(Lecun Initialization)  
- GELU, Swish, Mish   -->

<!-- 
### Batch Normalization
```python
model = tf.keras.Sequential([
    ...
    tf.keras.layers.BatchNormalization()
    ...
])
``` -->

<!-- ### Gradient Clipping -->
