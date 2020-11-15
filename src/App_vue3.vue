<template>
  <div id="app">
    <div class="search-input">
      <i class="iconfont icon-search"></i>
      <input
        type="text"
        placeholder="搜索歌曲"
        v-model="searchWord"
        @input="headleToSuggest"
        @keydown.13="heandleToList(searchWord)"
      />
      <i class="iconfont icon-guanbi" @click="headleToClose"></i>
    </div>
    <template v-if="searchType === 1">
      <div class="search-history">
        <div class="search-history-head">
          <span>历史记录</span>
          <i class="iconfont icon-lajitong" @click="heandleClearWord"></i>
        </div>
      </div>
      <div class="search-history-list">
        <div
          v-for="(item, index) in searchHistory"
          @click="heandleToList(item)"
          :key="index"
        >
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
import axios from "axios";
import { reactive, ref, toRefs, onMounted } from "@vue/composition-api";
import { toRef } from "vue";
export default {
  name: "app",
  setup() {
    const searchType = ref(1);
    const searchWord = ref("");
    const { searchHot } = useSearchHot();
    const { searchSuggest, headleToSuggest } = useSearchSuggest(
      searchType,
      searchWord
    );
    const { searchList, heandleToList, headleToClose } = useSearchList(
      searchType,
      searchWord,
      function (word) {
        setToHistory(word)
      }
    );
    const {
      searchHistory,
      heandleClearWord,
      setToHistory,
    } = useSearchHistory();
    return {
      searchType,
      searchWord,
      searchHot,
      searchSuggest,
      headleToSuggest,
      searchList,
      heandleToList,
      headleToClose,
      searchHistory,
      heandleClearWord,
      setToHistory,
    };
  },
};
function useSearchHot() {
  const state = reactive({
    searchHot: [],
  });
  onMounted(() => {
    axios.get("/search/hot/detail").then((res) => {
      state.searchHot = res.data.data;
    });
  });

  return toRefs(state);
}
function useSearchSuggest(searchType, searchWord) {
  const state = reactive({
    searchSuggest: [],
  });
  const { searchSuggest } = toRefs(state);
  const headleToSuggest = () => {
    if (!searchWord.value) {
      searchType.value = 1;
      return;
    }
    axios
      .get(`/search/suggest?keywords=${searchWord.value}&type=mobile`)
      .then((res) => {
        state.searchSuggest = res.data.result.allMatch;
        searchType.value = 3;
      });
  };
  return {
    searchSuggest,
    headleToSuggest,
  };
}

function useSearchList(searchType, searchWord, callback) {
  const state = reactive({
    searchList: [],
  });
  const { searchList } = toRefs(state);
  const headleToClose = () => {
    searchType.value = 1;
    searchWord.value = "";
  };
  const getSearchList = (word) => {
    axios.get(`/search?keywords=${word}`).then((res) => {
      state.searchList = res.data.result.songs;
      searchType.value = 2;
    });
  };
  const heandleToList = (word) => {
    console.log(word)
    if (!word) {
      searchType.value = 1;
      return;
    }
    searchWord.value = word;
    getSearchList(word);
    callback(word)
  };
  return {
    searchList,
    heandleToList,
    headleToClose,
  };
}

function useSearchHistory() {
  const state = reactive({
    searchHistory: [],
  });
  const { searchHistory } = toRefs(state);

  const setToHistory = (word) => {
    state.searchHistory.unshift(word);
    state.searchHistory = [...new Set(state.searchHistory)];
    if (state.searchHistory.length > 10) {
      state.searchHistory.length = 10;
    }
    setStorage({
      key: "searchHistory",
      data: state.searchHistory,
    });
  };

  const heandleClearWord = () => {
    removeStorage({
      key: "searchHistory",
      success: () => {
        state.searchHistory = [];
      },
    });
  };

  onMounted(() => {
    getStorage({
      key: "searchHistory",
      success: (data) => {
        state.searchHistory = data || [];
      },
    });
  });
  return {
    searchHistory,
    heandleClearWord,
    setToHistory,
  };
}

function setStorage({ key, data }) {
  window.localStorage.setItem(key, JSON.stringify(data));
}
function getStorage({ key, success }) {
  let data = window.localStorage.getItem(key);
  success(JSON.parse(data));
}
function removeStorage({ key, success }) {
  window.localStorage.removeItem(key);
  success();
}
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
.icon-play,
.icon-lajitong,
.icon-guanbi {
  cursor: pointer;
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
  cursor: pointer;
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
  cursor: pointer;
}
.search-suggest-item i {
  color: #bdbdbd;
  margin-right: 14px;
  position: relative;
  top: 1px;
}
</style>
