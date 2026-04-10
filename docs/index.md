---
layout: home

hero:
  name: Sakana!
  text: Widget
  tagline:  |
    Add the Sakana! Widget to your own web page!
    把石蒜模拟器添加到你自己的网页内！
  image:
    src: https://raw.githubusercontent.com/dsrkafuu/sakana-widget/main/src/characters/takina.png
    alt: Takina
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/
    - theme: alt
      text: GitHub
      link: https://github.com/dsrkafuu/sakana-widget
---

<script setup>
import Sakana from './Sakana.vue'
</script>

## 🐟「Sakana! Widget」

Add the Sakana! Widget to your own web page! Support custom images, auto
resizing and more runtime params!

把石蒜模拟器添加到你自己的网页内！支持自定义图片、自动缩放和更多运行参数！

<ClientOnly><Sakana /></ClientOnly>
