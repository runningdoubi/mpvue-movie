<template>
    <div class="main">
      <div class="top">
        <header class="header">
          <span class="title">看电影</span>
          <span class="hot" @click="showHot">热门</span>
        </header>
        <div class="search-wrapper">
          <icon class="icon" type="search" size="20"/>
          <input type="text" @confirm="searchMovie" confirm-type="search" placeholder="请输入你想看的电影">
        </div>
      </div>
      <scroll-view scroll-y class="container" @scrolltolower='loadMore'>
        <a class="item-wrapper" href="/pages/showMovie/main" v-for="(item, index) in movies" :key="index" @click="set_currentMovie(item)">
          <div class="item">
            <div class="img-wrapper">
              <img :src="item.coverImage" lazy-load="true" class="item-img" />
            </div>
            <div class="info-wrapper">
              <div class="name">{{item.name}}</div>
              <div class="download">下载</div>
              <div v-if="!item.downloadURL.length">暂无链接</div>
            </div>
          </div>
          <ul class="downurls-wrapper">
            <li class="item-url" v-for="(url, i) in item.downloadURL" :key="i" @click.stop="saveMovie(url)">{{i+1}}.{{url}}</li>
          </ul>
        </a>
      </scroll-view>
    </div>
</template>

<script>
import conf from 'config'
import {mapMutations} from 'vuex'

export default {
  data () {
    return {
      movies: [],
      hot_movies: [],
      search_movies: [],
      hot_page: 1,
      search_page: 1,
      isSearch: false,
      loading: false
    }
  },
  created () {
    this._getMore()
    wx.setNavigationBarTitle({
      title: '看电影'
    })
    wx.setTabBarItem({
      index: 0,
      text: 'text',
      iconPath: '/path/to/iconPath',
      selectedIconPath: '/path/to/selectedIconPath'
    })
  },
  methods: {
    ...mapMutations({
      'set_currentMovie': 'SET_CURRENT_MOVIE'
    }),
    loadMore () {
      if (this.isSearch) {
        this.search_page++
      } else {
        this.hot_page++
      }
      this._getMore()
    },
    showHot () {
      this.movies = this.hot_movies
      this.isSearch = false
    },
    searchMovie (e) {
      let _this = this
      let keyword = e.target.value
      if (keyword.length < 3) {
        wx.showModal({
          title: '提示',
          content: '请输入三个以上字符',
          showCancel: false,
          confirmText: '知道了'
        })
        return
      }
      this.keyword = keyword
      this.isSearch = true
      wx.showLoading({
        title: '加载中'
      })
      wx.request({
        url: `${conf.baseUrl}/dytt/dyttSearch`,
        data: {
          keyword,
          page: this.search_page
        },
        success: function (res) {
          if (res.data.success) {
            if (!res.data.result.length) {
              wx.showModal({
                title: '友情提示',
                content: '没有查询结果',
                showCancel: false,
                confirmText: '知道了'
              })
              return
            }
            _this.movies = res.data.result
          }
        },
        complete: function () {
          wx.hideLoading()
          _this.loading = false
        }
      })
    },
    saveMovie (url) {
      wx.downloadFile({
        url,
        success (res) {
          wx.saveFile({
            url: res.tempFilePath,
            success (res) {
              wx.showToast({
                title: '保存成功'
              })
              console.log(res.savedFilePath)
            },
            fail (e) {
              console.log(e)
            }
          })
        },
        fail (e) {
          console.log(e)
        }
      })
    },
    _getMore () {
      let _this = this
      if (_this.loading) {
        return
      }
      this.loading = true
      wx.showLoading({
        title: '加载中'
      })
      let url = this.isSearch ? `${conf.baseUrl}/dytt/dyttSearch` : `${conf.baseUrl}/dytt/dyttNew`
      let data = this.isSearch ? {keyword: this.keyword, page: this.search_page} : {page: this.hot_page}
      wx.request({
        url,
        data,
        success: function (res) {
          console.log(res.data)
          if (!res.data.result.length) {
            wx.showToast({
              title: '没有更多了'
            })
            return
          }
          _this.isSearch ? _this.search_movies = _this.search_movies.concat(res.data.result) : _this.hot_movies = _this.hot_movies.concat(res.data.result)
          _this.isSearch ? _this.movies = _this.search_movies : _this.movies = _this.hot_movies
        },
        complete: function () {
          wx.hideLoading()
          _this.loading = false
        }
      })
    }
  }
}
</script>

<style scoped>
.main{
  font-family: '微软雅黑';
  background:ivory;
}
.top{
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  opacity: 0.5;
}
.top .header{
  position: relative;
  padding: 15px 10px 10px;
  text-align: center;
  font-size: 16px;
}
.top .hot{
  position: absolute;
  right: 10px;
  font-size: 14px;
}
.search-wrapper{
  display: flex;
  align-items: center;
  padding: 0 10px 5px;
}
.search-wrapper .icon{
  margin-right: 5px;
}
.search-wrapper input{
  display: inline-block;
  padding: 5px 0;
  font-size: 14px;
}
.container{
  height: 100vh;
  padding: 87px 10px 10px;
}
.container .item-wrapper{
  margin-bottom: 10px;
}
.container .item{
  display: flex;
}
.container .item .img-wrapper .item-img{
  width: 100px;
  height: 100px;
}
.container .item .info-wrapper{
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding: 0 10px;
  font-size: 14px;
}
.container .downurls-wrapper .item-url{
  font-size: 12px;
}
</style>
