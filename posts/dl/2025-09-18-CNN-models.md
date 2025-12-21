---
layout: post
category: DL
tags: ['deep learning']
date: 2025-09-18

title: GGML C4W2 - Deep Convolutional Models Case Studies
author: Akai Red
description:
    LeNet-5, AlexNet, ResNet 등 유명한 CNN 모델을 알아보자.
image: 
optimized_image: 

show_thumbnail: true
math: true
published: true
---

## Structure of CNN
합성곱 신경망(CNN, Convolutional Neural Network)은 컴퓨터 비전 분야에서 획기적인 발전을 가져온 딥러닝 모델이다. ILSVRC 이미지 분류 대회에서 큰 성과를 거두며 주목받았다. CNN의 구조는 추후 다른 분야의 모델에도 영향을 주었다. 여기서는 대표적인 CNN 모델들을 살펴본다.


### LeNet-5 (1998)
```python
import tensorflow as tf
from tensorflow.keras.layers import Conv2D, AveragePooling2D, Dense, Flatten

model_lenet5 = tf.keras.Sequential([
    Conv2D(filters=6, kernel_size=(5,5), strides=1, activation='tanh', name='C1', 
           input_shape=(28,28,1)),
    AveragePooling2D((2,2), name='S2'),
    Conv2D(filters=16, kernel_size=(5,5), strides=1, activation='tanh',name='C3'),
    AveragePooling2D((2,2), name='S4'),
    Conv2D(filters=120, kernel_size=(1,1), strides=1, activation='tanh',name='C5'),
    Flatten(),
    Dense(units=84, activation='tanh',name='F6'),
    Dense(units=10, activation='softmax',name='Output')
])

model_lenet5.summary()
```
| Layer | Type | Feature Map | Size | Kernel Size | Stride | Activation |
|-------|------|--------------|------|-------------|--------|------------|
| Input | Input| 1            | 32x32|     -       |   -    |     -      |
| C1    | Conv | 6            | 28x28| 5x5         |   1    |   tanh     |
| S2    | Pool | 6            | 14x14| 2x2         |   2    |   tanh     |
| C3    | Conv | 16           | 10x10| 5x5         |   1    |   tanh     |
| S4    | Pool | 16           | 5x5  | 2x2         |   2    |   tanh     |
| C5    | Conv | 120          | 1x1  | 5x5         |   1    |   tanh     |
| F6    | Dense| 84           |  -   |     -       |   -    |   tanh     |
| Output | Dense| 10          |  -   |     -       |   -    |   softmax  |

LeNet-5는 Yann LeCun이 1998년에 발표한 딥러닝의 기념비적인 모델이다. 이 모델은 MNIST 문자 인식기를 위해 만들어졌으며, 합성곱 신경망(Conv)와 풀링 기법을 적용했다. 층이 올라갈수록 커널은 많아지며, 최종적으로 완전연결(FC;FullyConnected) 신경망으로 연결한다.

![](/imgs/2025-09-18-21-14-46.png)

1998년 모델이라 현대 기준으로는 그렇게 정확도가 높은 모델이 아니며 개선점도 많다. 풀링은 AvgPool 보다는 MaxPool로 교체하고, 활성화 함수도 tanh보다는 ReLU를 사용하는 것이 정확도를 높일 수 있다. 그러나 단순한 과제에는 여전히 효과적이며 추후 나올 많은 모델의 시초로서 중요하다.


### AlexNet (2012)
```python
import tensorflow as tf
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Dense, Flatten, Dropout

model = tf.keras.Sequential([
    Conv2D(96, (11, 11), strides=4, activation='relu', input_shape=(227, 227, 3)),
    MaxPooling2D((3, 3), strides=2),
    Conv2D(256, (5, 5), padding='same', activation='relu'),
    MaxPooling2D((3, 3), strides=2),
    Conv2D(384, (3, 3), padding='same', activation='relu'),
    Conv2D(384, (3, 3), padding='same', activation='relu'),
    Conv2D(256, (3, 3), padding='same', activation='relu'),
    MaxPooling2D((3, 3), strides=2),
    Flatten(),
    Dense(4096, activation='relu'),
    Dropout(0.5),
    Dense(4096, activation='relu'),
    Dropout(0.5),
    Dense(1000, activation='softmax')
])

model.compile(optimizer='adam', 
              loss='categorical_crossentropy', 
              metrics=['accuracy'])
model.summary()
```

AlexNet은 ILSVRC 이미지 분류 대회에서 2012년 전년 대비 급격한 개선을 이루며 우승해서 유명해진 모델이다. 기본적인 구조는 LeNet-5와 유사하지만, 훨씬 더 깊고 복잡하다.

![](/imgs/2025-09-17-20-22-18.png)

AlexNet은 기존 모델과 달리 ReLU를 활성화 함수로 사용했다. ReLU는 이전까지 사용하던 sigmoid, tanh 활성화 함수에 비해 기울기 소실에 강건했고 덕분에 AlexNet은 보다 깊고 큰 신경망을 학습시킬 수 있었다. 또한 과대적합을 방지하기 위해 Dropout을 사용했으며, 데이터 증식(Data Augmentation)을 사용했다. 


### GoogLeNet (2014)
```python
# Inception Module
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Concatenate, Input

input_layer = Input(shape=(224, 224, 3))

# 1x1 conv
conv1 = Conv2D(64, (1,1), padding='same', activation='relu')(input_layer)
# 3x3 conv
conv3 = Conv2D(128, (3,3), padding='same', activation='relu')(input_layer)
# 5x5 conv
conv5 = Conv2D(32, (5,5), padding='same', activation='relu')(input_layer)
# 3x3 maxpool + 1x1 conv
pool = MaxPooling2D((3,3), strides=(1,1), padding='same')(input_layer)
pool_conv = Conv2D(32, (1,1), padding='same', activation='relu')(pool)

# Concatenate all
output = Concatenate()([conv1, conv3, conv5, pool_conv])

model = Model(inputs=input_layer, outputs=output)
model.summary()


# InceptionV3 (later version of GoogLeNet)
from tensorflow.keras.applications import InceptionV3

model = InceptionV3(weights='imagenet', include_top=True)
model.summary()
```
2014년 ILSVRC 대회에서 우승한 GoogLeNet은 Inception Network에 해당한다. GoogLeNet이라고 하면 Inception v1을 일컫는 표현이고 이 뒤로 v2, v3, v4 계속 Inception 모델이 나온다.

![](/imgs/2025-09-18-20-11-49.png) 
![](/imgs/2025-09-22-20-11-31.png)

CNN에서 1x1, 3x3, 5x5 다양한 커널을 사용할 수 있다. 무슨 커널을 사용하는게 좋을지 고민이 되는데, Inception Network는 이 커널을 전부 사용하는 것으로 해결했다. 

same 패딩을 사용해서 출력값을 동일하게 하고 결과물을 채널 방향으로 깊게 연결한다. 출력값을 쌓으려면 출력값의 가로/세로를 맞춰야하기 때문에 same 패딩은 필수다. 맥스 풀링에서도 예외는 아니다.

![](/imgs/2025-09-18-20-18-00.png)

이런 식으로 커널을 다 때려넣다보면 당연히 계산량이 늘어나게 된다. Inception Network는 중간에 병목 레이어*Bottleneck Layer*를 넣음으로써 이 문제를 해결한다. 

병목 레이어에서 1x1 커널을 사용해서 일단 작게 만든 뒤, 다시 크기를 키운다. 파라미터 수가 일반 연결보다 약 10배 줄어들지만 성능은 떨어지지 않는다고 한다.

![](/imgs/2025-09-22-20-15-40.png)

Inception Network는 Inception Module이라고 부르는 이런 식의 멀티 커널 구조를 깊게 쌓아 AlexNet보다 깊지만, 파라미터 수는 더 적은 모델을 만들었다.


### VGG-16 (2014) 
```python
import tensorflow as tf
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense

model = tf.keras.Sequential([
    # Block 1
    Conv2D(64, (3, 3), activation='relu', padding='same', input_shape=(224, 224, 3)),
    Conv2D(64, (3, 3), activation='relu', padding='same'),
    MaxPooling2D((2, 2), strides=(2, 2)),
    # Block 2
    Conv2D(128, (3, 3), activation='relu', padding='same'),
    Conv2D(128, (3, 3), activation='relu', padding='same'),
    MaxPooling2D((2, 2), strides=(2, 2)),
    # Block 3
    Conv2D(256, (3, 3), activation='relu', padding='same'),
    Conv2D(256, (3, 3), activation='relu', padding='same'),
    Conv2D(256, (3, 3), activation='relu', padding='same'),
    MaxPooling2D((2, 2), strides=(2, 2)),
    # Block 4
    Conv2D(512, (3, 3), activation='relu', padding='same'),
    Conv2D(512, (3, 3), activation='relu', padding='same'),
    Conv2D(512, (3, 3), activation='relu', padding='same'),
    MaxPooling2D((2, 2), strides=(2, 2)),
    # Block 5
    Conv2D(512, (3, 3), activation='relu', padding='same'),
    Conv2D(512, (3, 3), activation='relu', padding='same'),
    Conv2D(512, (3, 3), activation='relu', padding='same'),
    MaxPooling2D((2, 2), strides=(2, 2)),
    # Classification block
    Flatten(),
    Dense(4096, activation='relu'),
    Dense(4096, activation='relu'),
    Dense(1000, activation='softmax')  # Change 1000 to your number of classes
])

model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
# model.summary()  # Uncomment to view the model architecture
```
VGG-16은 2014년 ILSVRC 대회에서 GoogLeNet에 이어 2위를 차지했다. VGG는 그 특유의 단순한 구조로 주목 받았는데 위쪽 코드와 아래쪽 도식에서 볼 수 있듯이 단 두 개의 커널만 사용한다. 3x3 CONV 커널과 2x2 맥스 풀링 커널이다. 다른 버전으로 VGG-19 등이 존재한다.

![](/imgs/2025-09-17-20-28-03.png)

### ResNet (2015)
```python
from tensorflow.keras.applications import ResNet50
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Flatten, Dense

resnet_model = ResNet50(input_shape=(224,224,3), 
                        include_top=False)
resnet_model.trainable = False
 
model = Sequential()
model.add(resnet_model)
model.add(Flatten())
model.add(Dense(4096, activation='relu'))   # FC Layer
model.add(Dense(1000, activation='softmax'))  # Output Layer

model.summary()
```
ResNet은 2015년 ILSVRC 대회에서 우승하였다. 우승한 네트워크는 152개 층을 가진 네트워크였는데 34개, 50개, 101개 등 다른 버전도 존재한다. 사전학습된 ResNet 모델이 keras 내에 존재하며 위와 같이 불러올 수 있다.

![](/imgs/2025-09-17-20-36-58.png)

ResNet은 잔차 네트워크*Residual Network*를 말한다. 이름대로 네트워크의 핵심 역할을 하는 잔차 블록*Residual Block*이 존재한다. 잔차 블록은 메인 패스 외에도 숏컷/스킵 연결을 추가했다.

만약 $z^{l+2}$가 0보다 작다면 ReLU 활성화 함수의 결과는 0이 되고 죽은 ReLU가 된다. 이를 방지하기 위해 2레이어 전의 출력값 $a^{l}$을 스킵 연결을 통해 추가한다. 

![](/imgs/2025-09-17-20-56-57.png)

스킵 연결을 통해 온 $a^{l}$ 학습이 죽지 않게 만든다. 만약 $z^{l+2}$가 0이 된다고 해도, 모델은 $a^{l+2} = a^{l}$의 항등 함수가 된다. 이러한 특성으로 인해 목적 함수가 항등 함수에 가깝다면 ResNet의 훈련 속도는 매우 빨라지게 된다. 

![](/imgs/2025-09-17-20-40-22.png)

일반적인 모델 사이에 스킵 연결을 추가해 잔차 모듈로 만들면, 레이어의 개수를 늘려도 학습 오류가 늘지 않게 된다.  

### Later CNN Models 
- Xception
- SENet (2017)
- ResNeXt
- DenseNet
- MobileNet
- CSPNet
- EfficientNet

앞서 언급한 모델 외에도 많은 CNN의 변형 모델이 존재한다. SENet은 2017년 마지막 ILSVRC 대회에서 우승하였다. SENet이 인간 정확도 이상의 이미지 분류 성능을 달성했기 때문에 대회를 지속할 이유가 없다고 판단했다.

EfficientNet은 등장 당시부터 현재까지 매우 좋은 성능을 낸 모델이다. MobileNet은 방향성이 약간 다른데, 분류 성능보다는 애플리케이션에 탑재할 수 있을 정도의 가벼운 모델로의 최적화를 추구했다.


## C​opyright Notice

나는 슬라이드에서 명시한 저작권 기준 CCL를 최대한 따르고자 했고 Coursera 강의와 관련한 앞으로의 포스트도 그러할 것이다. [DeepLearning.AI](https://www.deeplearning.ai/)은 첨부한 슬라이드 이미지의 원 저작자임이며 본 글은 영리적 목적이 아닌 교육적 목적으로 작성되었음을 밝힌다. 또한 슬라이드 이미지의 저작권은 원 저작자의 뜻대로 [Creative Commons 2.0](https://creativecommons.org/licenses/by-sa/2.0/legalcode)을 따른다.