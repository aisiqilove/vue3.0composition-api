
<template>
  <div id="app">
    <div ref="list"
         class="infinite-list-container"
         @scroll="scrollEvent($event)">
      <div class="infinite-list-phantom"
           :style="{ height: listHeight + 'px' }"></div>
      <div class="infinite-list"
           :style="{ transform: getTransform }">
        <div class="infinite-list-item"
             v-for="item in visibleData"
             :key="item.id"
             :style="{ height: itemSize + 'px', lineHeight: itemSize + 'px' }">
          <span>{{item}}</span>
        </div>
      </div>
    </div>
  </div>
</template>
 
<script>
export default {
  name: 'app',
  props: {
    //所有列表数据
    listData: {
      type: Array,
      default: () => []
    },
    //每项高度
    itemSize: {
      type: Number,
      default: 100
    }
  },
  computed: {
    // 列表总高度
    listHeight () {
      return this.listData.length * this.itemSize;
    },
    // 可显示的列表项数
    visibleCount () {
      return Math.ceil(this.screenHeight / this.itemSize)
    },
    // 偏移量对应的style
    getTransform () {
      return `translate3d(0, ${this.startOffset}px, 0)`
    },
    // 获取真实显示列表数据
    visibleData () {
      return this.listData.slice(this.start, Math.min(this.end, this.listData.length))
    }
  },
  created () {
    for (var i = 0; i < 10000; i++) {
      this.listData.push(i)
    }
  },
  mounted () {
    // 页面数据初始化
    this.screenHeight = this.$el.clientHeight
    this.start = 0
    // 这里的截取结束位置需要根据开始位置和首屏显示的条数来确定
    this.end = this.start + this.visibleCount
  },
  data () {
    return {
      // 可视区域高度
      screenHeight: 0,
      // 偏移量
      startOffset: 0,
      // 起始索引
      start: 0,
      // 结束索引
      end: null,
    };
  },
  methods: {
    scrollEvent () {
      // 当前滚动位置
      let scrollTop = this.$refs.list.scrollTop
      // 此时的开始索引
      this.start = Math.floor(scrollTop / this.itemSize)
      // 此时的结束索引
      this.end = this.start + this.visibleCount
      // 滚动时列表盒子的偏移量
      this.startOffset = scrollTop - (scrollTop % this.itemSize)
    }
  }
}
</script>
 
<style >
body {
  margin: 0 !important;
  padding: 0 !important;
}
* {
  margin: 0;
  padding: 0;
}
#app {
  width: 100vw;
  height: 100vh;
}
.infinite-list-container {
  width: 100%;
  height: 100%;
  overflow: auto;
  position: relative;
  -webkit-overflow-scrolling: touch;
}

.infinite-list-phantom {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  z-index: -1;
}

.infinite-list {
  left: 0;
  right: 0;
  top: 0;
  position: absolute;
  text-align: center;
}

.infinite-list-item {
  padding: 10px;
  color: #555;
  box-sizing: border-box;
  border-bottom: 1px solid #999;
}
</style>