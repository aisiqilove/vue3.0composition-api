<template>
  <div id="app">
    <div class="search-input">
      <i class="iconfont icon-search"></i>
      <input
        type="text"
        placeholder="搜索歌曲"
        v-model="searchWord"
        @input="heandleToSuggest"
        @keydown.enter="heandleToList(searchWord)"
      />
      <i class="iconfont icon-guanbi" @click="clearWord"></i>
    </div>
    <template v-if="searchType === 1">
      <div class="search-history">
        <div class="search-history-head">
          <span>历史记录</span>
          <i class="iconfont icon-lajitong" @click="heandleClearWord"></i>
        </div>
      </div>
      <div class="search-history-list">
        <div v-for="(item, index) in searchHistoryWord" :key="index">
          {{ item }}
        </div>
      </div>
      <div class="search-hot">
        <div class="search-hot-head">热搜榜</div>
        <div
          class="search-hot-item"
          v-for="(hot, index) in searchHot"
          :key="index"
        >
          <div class="search-hot-top">{{ index + 1 }}</div>
          <div class="search-hot-word">
            <div>
              {{ hot.searchWord }}
              <img v-show="hot.iconUrl" :src="hot.iconUrl" />
            </div>
            <div>{{ hot.content }}</div>
          </div>
          <span class="search-hot-count">{{ hot.score }}</span>
        </div>
      </div>
    </template>

    <template v-if="searchType === 2">
      <div class="search-result">
        <div
          class="search-result-item"
          v-for="(list, index) in searchList"
          :key="index"
        >
          <div class="search-result-word">
            <div>{{ list.name }}</div>
            <div>{{ list.album.name }}</div>
          </div>
          <i class="iconfont icon-play"></i>
        </div>
      </div>
    </template>
    <template v-if="searchType === 3">
      <div class="search-suggest">
        <div class="search-suggest-head">搜索{{ searchWord }}</div>
        <div
          class="search-suggest-item"
          v-for="(word, index) in searchSuggest"
          :key="index"
          @click="heandleToList(word.keyword)"
        >
          <i class="iconfont icon-search"></i>{{ word.keyword }}
        </div>
      </div>
    </template>
  </div>
</template>

<script>
// import "@/assets/iconfont/iconfont.css";
import axios from "axios";
export default {
  name: "app",
  data() {
    return {
      searchType: 1,
      searchHot: [],
      searchSuggest: [],
      searchList: [],
      searchWord: "",
      searchHistory: [],
      searchHistoryWord: [],
    };
  },
  components: {},
  methods: {
    clearWord() {
      this.searchWord = "";
      this.searchType = 1;
    },
    getSearchList(word) {
      axios.get(`/search?keywords=${word}`).then((res) => {
        this.searchList = res.data.result.songs;
        this.searchType = 2;
      });
    },
    heandleToList(word) {
      if (!word) {
        this.searchType = 1;
        return;
      }
      this.searchHistoryWord.unshift(word);
      this.searchHistoryWord = [...new Set(this.searchHistoryWord)];
      if (this.searchHistoryWord.length > 10) {
        this.searchHistoryWord.length = 10;
      }
      this.setStorage({
        key: "searchHistoryWord",
        data: this.searchHistoryWord,
      });
      this.searchWord = word;
      this.getSearchList(word);
    },
    heandleToSuggest() {
      if (!this.searchWord) {
        this.searchType = 1;
        return;
      }
      axios
        .get(`/search/suggest?keywords=${this.searchWord}&type=mobile`)
        .then((res) => {
          this.searchSuggest = res.data.result.allMatch;
          this.searchType = 3;
        });
    },
    heandleClearWord() {
      this.removeStorage({
        key: "searchHistoryWord",
        succes: () => {
          console.log("删除历史记录");
          this.searchHistoryWord = [];
        },
      });
    },
    setStorage({ key, data }) {
      window.localStorage.setItem(key, JSON.stringify(data));
    },
    getStorage({ key, succes }) {
      let data = window.localStorage.getItem(key);
      succes(JSON.parse(data));
    },
    removeStorage({ key, succes }) {
      window.localStorage.removeItem(key);
      succes();
    },
  },
  mounted() {
    axios.get("/search/hot/detail").then((res) => {
      this.searchHot = res.data.data;
    });
    this.getStorage({
      key: "searchHistoryWord",
      succes: (data) => {
        this.searchHistoryWord = data || [];
      },
    });
  },
};
</script>

<style>
.search-input {
  display: flex;
  align-items: center;
  height: 35px;
  margin: 35px 15px 25px 15px;
  background-color: #f7f7f7;
  border-radius: 25px;
}
.search-input i {
  margin: 0 12px;
}
.search-input input {
  flex: 1;
  font-size: 14px;
  border: none;
  background-color: #f7f7f7;
  outline: none;
}
.search-history {
  margin: 0 15px 25px 15px;
  font-size: 14px;
}
.search-history-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 18px;
}
.search-history-list {
  display: flex;
  flex-wrap: wrap;
}
.search-history-list div {
  padding: 8px 14px;
  border-radius: 20px;
  background-color: #f7f7f7;
  margin-right: 15px;
  margin-bottom: 15px;
}
.search-hot {
  margin: 0 15px;
  font-size: 14px;
}
.search-hot-head {
  margin-bottom: 18px;
}
.search-hot-item {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}
.search-hot-top {
  color: #fb2222;
  width: 30px;
  margin-left: 4px;
}
.search-hot-word {
  flex: 1;
}
.search-hot-word div:nth-child(1) {
  font-size: 16px;
  color: #333;
}
.search-hot-word div:nth-child(1) img {
  height: 17px;
}
.search-hot-word div:nth-child(2) {
  font-size: 12px;
  color: #878787;
}
.search-hot-count {
  color: #878787;
}
.search-result {
  border-top: 1px solid #e4e4e4;
  padding: 15px;
}
.search-result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 15px;
  margin-bottom: 15px;
  border-bottom: 1px solid #e4e4e4;
}
.search-result-word div:nth-child(1) {
  font-size: 16px;
  color: #235790;
  margin-bottom: 6px;
}
.search-result-word div:nth-child(2) {
  font-size: 14px;
  color: #898989;
}
.search-result-item i {
  font-size: 30px;
  color: #878787;
}
.search-suggest {
  border-top: 1px solid #e4e4e4;
  padding: 15px;
  font-size: 14px;
}
.search-suggest-head {
  color: #4574a5;
  margin-bottom: 36px;
}
.search-suggest-item {
  color: #5d5d5d;
  margin-bottom: 36px;
}
.search-suggest-item i {
  color: #bdbdbd;
  margin-right: 14px;
  position: relative;
  top: 1px;
}
</style>
