export default {
  props: ['pages'],
  data() {
    return {

    }
  },
  methods: {
    emitPages(item) { //傳送點擊頁碼的資料給renderProducts
      this.$emit('emit-pages', item);
    }
  },
  template://中間的li內容-> v-if 控制頁碼是當前頁碼則生成span標籤不給點擊，反之v-else 生成a標籤可點擊其他頁碼 
    `<nav aria-label="Page navigation example">
      <ul class="pagination">
        <li class="page-item" :class="{'disabled': pages.current_page === 1 }">
          <a class="page-link" href="#" aria-label="Previous" @click.prevent="emitPages(pages.current_page - 1)">
            <span aria-hidden="true">&laquo;</span>
          </a>
        </li>
        <li class="page-item" v-for="( item, index) in pages.total_pages" :key="index">
          <span class="page-link" v-if="item === pages.current_page">{{ item }}</span> 
          <a class="page-link" href="#" v-else @click.prevent="emitPages(item)">{{item}}</a>
        </li>
        <li class="page-item" :class="{'disabled': pages.current_page === pages.total_pages }">
          <a class="page-link" href="#" aria-label="Next" @click.prevent="emitPages(pages.current_page + 1)">
            <span aria-hidden="true">&raquo;</span>
          </a>
        </li>
      </ul>
    </nav>`
}