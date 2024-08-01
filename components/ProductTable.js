export default {
   //產品列表一覽
    props: ['products'],
    data() {
      return {
  
      }
    },
    methods: {
      openModal(isNew, item) {
        this.$emit('openCreatedModal', isNew, item)
      }
    },
    template:
      `<table class="table mt-4">
        <thead>
          <tr>
            <th width="120">分類</th>
            <th>產品名稱</th>
            <th width="120">原價</th>
            <th width="120">售價</th>
            <th width="100">是否啟用</th>
            <th width="120">編輯</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in products" :key="item.id">
            <td>{{item.category}}</td>
            <td>{{item.title}}</td>
            <td class="text-start">{{item.origin_price}}</td>
            <td class="text-start">{{item.price}}</td>
            <td>
              <span class="text-success" v-if="item.is_enabled === 1">啟用</span>
              <span v-else>未啟用</span>
            </td>
            <td>
              <div class="btn-group">
                <button type="button" class="btn btn-outline-primary btn-sm" @click="openModal('edit', item)">編輯</button>
                <button type="button" class="btn btn-outline-danger btn-sm" @click="openModal('delete',item)">刪除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>`,
  };