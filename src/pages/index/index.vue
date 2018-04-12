<template>
    <div class="main">
      <div class="top">
        <header class="header">看电影</header>
        <div class="search-wrapper">
          <icon class="icon" type="search" size="20"/>
          <input type="text" @confirm="searchMovie" confirm-type="search" placeholder="请输入你想看的电影">
        </div>
      </div>
      <scroll-view scroll-y class="container" @scrolltolower='loadMore'>
        <div class="item" v-for="(item, index) in movies" :key="index">
          <div class="img-wrapper">
            <image :src="item.coverImage" lazy-load="true" class="item-img" />
          </div>
          <div class="info-wrapper">
            <div class="name">{{item.name}}</div>
            <div class="download" v-for="(url, i) in item.downloadURL" :key="i">下载</div>
            <div v-if="!item.downloadURL.length">暂无链接</div>
          </div>
        </div>
      </scroll-view>
    </div>
</template>

<script>
import conf from 'config'

export default {
  data () {
    return {
      movies: [],
      page: 1,
      loading: false,
      height: ''
    }
  },
  created () {
    this._getMore()
  },
  methods: {
    loadMore () {
      this.page++
      this._getMore()
    },
    searchMovie (e) {
      console.log(e)
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
      wx.showLoading({
        title: '加载中'
      })
      wx.request({
        url: `${conf.baseUrl}/dytt/dyttSearch`,
        data: {
          keyword
        },
        success: function (res) {
          console.log(res.data)
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
    _getMore () {
      let _this = this
      if (_this.loading) {
        return
      }
      _this.loading = true
      wx.showLoading({
        title: '加载中'
      })
      wx.request({
        url: `${conf.baseUrl}/dytt/dyttNew`,
        data: {
          page: this.page
        },
        success: function (res) {
          console.log(res.data)
          _this.movies = [..._this.movies, ...res.data.result]
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
}
.header{
  padding: 10px;
  text-align: center;
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
</style>
