// 元件化 外部導入
import ProductTable from './components/ProductTable.js';
import NewProductBtn from './components/NewProductBtn.js';
import ProductModal from './components/ProductModal.js';
import DelProductModal from './components/DelProductModal.js';
import Pagination from './components/Pagination.js';

const { createApp } = Vue;
let proModal, delModal = '';

const app = createApp({
  components: { ProductTable, NewProductBtn, ProductModal, DelProductModal, Pagination},
  data() {
    return {
      url: 'https://vue3-course-api.hexschool.io/v2', // 請加入站點
      path: 'jasonfu-api-vuetest',// 請加入個人 API Path
      tempProduct: {},
      products: [],
      isNew: false,
      pagination: {},
      bsModal: '',
      formData: '',
    }
  },
  methods: {
    checkLoginToken() {
      axios.post(`${this.url}/api/user/check`)
        .then(res => {
          this.renderProducts();
        })
        .catch(err => {
          alert('請先登入');
          window.location.href = "./index.html"; //跳回登入頁
          console.dir(err.response.data.message);
        })
    },
    renderProducts(page = 1) {  //call API get產品資訊  默認頁碼設為1 當頁碼資料被傳入時page會被改變
      axios.get(`${this.url}/api/${this.path}/admin/products?page=${page}`)
        .then(res => {
          this.products = res.data.products;
          this.pagination = res.data.pagination;
          // console.log(this.pagination);
          // console.log(res.data);
        })
        .catch(err => {
          alert(err.response.data.message);
          console.dir(err.response.data.message);
        })
    },
    openModal(isNew, item) {
      if (isNew === 'new') { //開啟新增產品modal
        this.tempProduct = {
          imagesUrl: [],
        };
        this.isNew = true;
        // proModal.show();
        this.$refs.productModalComponent.openModal();
        this.$refs.productModalComponent.$refs.fileInput.value= '';
      }
      else if (isNew === 'edit') { //開啟編輯產品modal 深拷貝products的資料到tempProducts 因tempProduct有第二層屬性
        this.tempProduct = JSON.parse(JSON.stringify(item));
        this.isNew = false;
        // proModal.show();
        this.$refs.productModalComponent.openModal();
        this.$refs.productModalComponent.$refs.fileInput.value= '';
        
      }
      else if (isNew === 'delete') { //開啟刪除產品modal
        this.tempProduct = { ...item }
        // delModal.show();
        this.$refs.delProductModalComponent.delModalShow();
        
        
      }
    },
    checkImagesArray() { //檢查tempProduct的imagesUrl陣列不為空白
      if (this.tempProduct.imagesUrl) {
        this.tempProduct.imagesUrl = this.tempProduct.imagesUrl.filter(item => item !== '');  //篩選新增更多圖片的連結欄位不為空白 
      }
      // 原本想的方法 上面為GPT的方法
      // this.tempProduct.imagesUrl.forEach((item, index) => {
      //   if (item === '') {
      //     this.tempProduct.imagesUrl.splice(index, 1); //如果新增更多圖片的連結欄位是空白的 則將建立圖片的空字串清除
      //   }
      // });
    },
    confirmProduct() {  //在productModal 按下確認後call API post產品資訊

      //week4改用了GPT簡化week3的寫法
      // 根據是否有 id 決定 API 路徑和 HTTP 方法
      const isNewProduct = !this.tempProduct.id;
      const url = isNewProduct
        ? `${this.url}/api/${this.path}/admin/product`
        : `${this.url}/api/${this.path}/admin/product/${this.tempProduct.id}`;
      const httpMethod = isNewProduct ? 'post' : 'put';

      // 檢查圖片 URL 陣列
      this.checkImagesArray();

      // 檢查是否有編輯內容
      if (!isNewProduct) {
        const existingProduct = this.products.find(item => item.id === this.tempProduct.id);
        if (existingProduct && JSON.stringify(existingProduct) === JSON.stringify(this.tempProduct)) {
          alert('No changes made!!');
          return;
        }
      }

      // 呼叫 API
      axios[httpMethod](url, { data: this.tempProduct })
        .then(res => {
          this.renderProducts();
          alert(res.data.message);
          // proModal.hide();
          this.$refs.productModalComponent.closeModal();
        })
        .catch(err => {
          alert(err.response.data.message);
          console.dir(err.response.data.message);
        });
    },
    confirmDel() { //確認刪除產品
      const delProduct = this.products.find(item => item.id === this.tempProduct.id);
      if(delProduct){
        axios.delete(`${this.url}/api/${this.path}/admin/product/${this.tempProduct.id}`)
            .then(res => {
              this.tempProduct = {};
              // delModal.hide();
              this.$refs.delProductModalComponent.delModalHide();
              this.renderProducts();
              alert(res.data.message);
            })
            .catch(err => {
              alert(err.response.data.message);
              console.dir(err.response.data.message);
            });
      }

      // this.products.forEach((item) => {
      //   if (item.id === this.tempProduct.id) {
      //     axios.delete(`${this.url}/api/${this.path}/admin/product/${this.tempProduct.id}`)
      //       .then(res => {
      //         this.tempProduct = {};
      //         // delModal.hide();
      //         this.$refs.delProductModalComponent.delModalHide();
      //         this.renderProducts();
      //         alert(res.data.message);
      //       })
      //       .catch(err => {
      //         alert(err.response.data.message);
      //         console.dir(err.response.data.message);
      //       });
      //   }
      // });
    },
    createImages() {  //新增更多圖片
      if (!this.tempProduct.imagesUrl) {  //如果imagesUrl不存在 則幫他創建一個陣列
        this.tempProduct.imagesUrl = [];
      }
      this.tempProduct.imagesUrl.push(''); //如果imagesUrl已經存在，則在陣列中push一個新的空白欄位供填入
    },
    delImages(index) { //刪除圖片
      this.tempProduct.imagesUrl.splice(index, 1);
    },
    upload(){  //上傳圖片將資料儲存至formData
      const file = this.$refs.productModalComponent.$refs.fileInput.files[0];
      this.formData = new FormData();
      this.formData.append('file-to-upload', file);
    },
    uploadApi(){  //將formData打包給API上傳
      if(!this.formData){
        alert('No file to upload');
        return
      }

      axios.post(`${this.url}/api/${this.path}/admin/upload`, this.formData)
        .then(res => {
          alert('上傳成功')
          this.tempProduct.imageUrl = res.data.imageUrl;
          this.$refs.productModalComponent.$refs.fileInput.value = '';
          this.formData = '';
          console.log(res);
        })
        .catch(err => {
          console.log(err.res.response);
        })
    }
  },
  mounted() {
    // 取得cookie中的token ,並夾在headers中
    const token = document.cookie.replace(/(?:(?:^|.*;\s*)jasonToken\s*\=\s*([^;]*).*$)|^.*$/, "$1",);
    axios.defaults.headers.common['Authorization'] = token;
    this.checkLoginToken();  //call登入驗證

    console.log(this.$refs.productModalComponent.$refs); 
    //原week3用法 week4改用了refs的方式
    // proModal = new bootstrap.Modal(document.querySelector('#productModal'));  //取得productModal的DOM元素
    // delModal = new bootstrap.Modal(document.querySelector('#delProductModal')); //取得delProductModal的DOM元素  

  },
});

//元件改import化
//元件-全域註冊 (須放在根元件生成之後)
// app.component('productTable', { //產品列表一覽
//   props: ['products'],
//   data() {
//     return {

//     }
//   },
//   methods: {
//     openModal(isNew, item) {
//       this.$emit('openCreatedModal', isNew, item)
//     }
//   },
//   template:
//     `<table class="table mt-4">
//       <thead>
//         <tr>
//           <th width="120">分類</th>
//           <th>產品名稱</th>
//           <th width="120">原價</th>
//           <th width="120">售價</th>
//           <th width="100">是否啟用</th>
//           <th width="120">編輯</th>
//         </tr>
//       </thead>
//       <tbody>
//         <tr v-for="item in products" :key="item.id">
//           <td>{{item.category}}</td>
//           <td>{{item.title}}</td>
//           <td class="text-start">{{item.origin_price}}</td>
//           <td class="text-start">{{item.price}}</td>
//           <td>
//             <span class="text-success" v-if="item.is_enabled === 1">啟用</span>
//             <span v-else>未啟用</span>
//           </td>
//           <td>
//             <div class="btn-group">
//               <button type="button" class="btn btn-outline-primary btn-sm" @click="openModal('edit', item)">編輯</button>
//               <button type="button" class="btn btn-outline-danger btn-sm" @click="openModal('delete',item)">刪除</button>
//             </div>
//           </td>
//         </tr>
//       </tbody>
//     </table>`,
// });

// app.component('newProductBtn', { //建立新的產品的按鈕
//   data() {
//     return {

//     }
//   },
//   methods: {
//     openModal(isNew) {
//       this.$emit('openNewModal', isNew);
//     }
//   },
//   template:
//     `<button class="btn btn-primary" @click="openModal('new')">
//       建立新的產品
//     </button>`
// });

// app.component('productModal', { //modal元件
//   props: ['tempProduct'],
//   data() {
//     return {

//     }
//   },
//   methods: {
//     confirmProduct() {
//       this.$emit('confirm');
//     },
//     createImages() {
//       this.$emit('createImg');
//     },
//     delImages(id) {
//       this.$emit('delImg', id);
//     },
//     confirmDel() {
//       this.$emit('delProduct');
//     }
//   },
//   template:
//     `<div id="productModal" ref="productModal" class="modal fade" tabindex="-1" aria-labelledby="productModalLabel"
//       aria-hidden="true">
//       <div class="modal-dialog modal-xl">
//         <div class="modal-content border-0">
//           <div class="modal-header bg-dark text-white">
//             <h5 id="productModalLabel" class="modal-title">
//               <span>新增產品</span>
//             </h5>
//             <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
//           </div>
//           <div class="modal-body">
//             <div class="row">
//               <div class="col-sm-4">
//                 <div class="mb-2">
//                   <div class="mb-3">
//                     <label for="imageUrl" class="form-label">主要圖片</label>
//                     <input id="imageUrl" type="text" class="form-control" placeholder="請輸入圖片連結" v-model="tempProduct.imageUrl">
//                   </div>
//                   <img class="img-fluid" :src="tempProduct.imageUrl" alt="">
//                   <span v-for="(picture,id) in tempProduct.imagesUrl" v-bind:key="id">
//                     <label :for="'imagesUrl'+id" class="form-label mx-4">輸入圖片網址</label>
//                     <input :id="'imagesUrl'+id" type="text" class="form-control" placeholder="請輸入圖片連結" v-model="tempProduct.imagesUrl[id]">
//                     <img v-bind:src="picture" alt="" class="img-fluid  my-2">
//                     <div>
//                       <button class="btn btn-outline-danger btn-sm d-block my-2 w-100" @click="delImages(id)">刪除圖片</button>
//                     </div>
//                   </span>
//                   <div>
//                     <button class="btn btn-outline-primary btn-sm d-block  my-2 w-100" @click="createImages">新增更多圖片</button>
//                   </div>
//                 </div>
//               </div>
//               <div class="col-sm-8">
//                 <div class="mb-3">
//                   <label for="title" class="form-label">標題</label>
//                   <input id="title" type="text" class="form-control" placeholder="請輸入標題" v-model="tempProduct.title">
//                 </div>

//                 <div class="row">
//                   <div class="mb-3 col-md-6">
//                     <label for="category" class="form-label">分類</label>
//                     <input id="category" type="text" class="form-control" placeholder="請輸入分類"
//                       v-model="tempProduct.category">
//                   </div>
//                   <div class="mb-3 col-md-6">
//                     <label for="unit" class="form-label">單位</label>
//                     <input id="unit" type="text" class="form-control" placeholder="請輸入單位" v-model="tempProduct.unit">
//                   </div>
//                 </div>

//                 <div class="row">
//                   <div class="mb-3 col-md-6">
//                     <label for="origin_price" class="form-label">原價</label>
//                     <input id="origin_price" type="number" min="0" class="form-control" placeholder="請輸入原價"
//                       v-model.number="tempProduct.origin_price">
//                   </div>
//                   <div class="mb-3 col-md-6">
//                     <label for="price" class="form-label">售價</label>
//                     <input id="price" type="number" min="0" class="form-control" placeholder="請輸入售價"
//                       v-model.number="tempProduct.price">
//                   </div>
//                 </div>
//                 <hr>

//                 <div class="mb-3">
//                   <label for="description" class="form-label">產品描述</label>
//                   <textarea id="description" type="text" class="form-control" placeholder="請輸入產品描述"
//                     v-model="tempProduct.description">
//                     </textarea>
//                 </div>
//                 <div class="mb-3">
//                   <label for="content" class="form-label">說明內容</label>
//                   <textarea id="content" type="text" class="form-control" placeholder="請輸入說明內容"
//                     v-model="tempProduct.content">
//                     </textarea>
//                 </div>
//                 <div class="mb-3">
//                   <div class="form-check">
//                     <input id="is_enabled" class="form-check-input" type="checkbox" :true-value="1" :false-value="0"
//                       v-model="tempProduct.is_enabled">
//                     <label class="form-check-label" for="is_enabled">是否啟用</label>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div class="modal-footer">
//             <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">取消</button>
//             <button type="button" class="btn btn-primary" @click="confirmProduct">確認</button>
//           </div>
//         </div>
//       </div>
//     </div>
//     <div id="delProductModal" ref="delProductModal" class="modal fade" tabindex="-1"
//       aria-labelledby="delProductModalLabel" aria-hidden="true">
//       <div class="modal-dialog">
//         <div class="modal-content border-0">
//           <div class="modal-header bg-danger text-white">
//             <h5 id="delProductModalLabel" class="modal-title">
//               <span>刪除產品</span>
//             </h5>
//             <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
//           </div>
//           <div class="modal-body">
//             是否刪除【{{this.tempProduct.title}}】
//             <strong class="text-danger"></strong> 商品(刪除後將無法恢復)。
//           </div>
//           <div class="modal-footer">
//             <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">取消</button>
//             <button type="button" class="btn btn-danger" @click="confirmDel">確認刪除</button>
//           </div>
//         </div>
//       </div>
//     </div>`
// });

// app.component('pagination', {  //分頁元件
//   props: ['pages'],
//   data() {
//     return {

//     }
//   },
//   methods: {
//     emitPages(item) { //傳送點擊頁碼的資料給renderProducts
//       this.$emit('emit-pages', item);
//     }
//   },
//   template://中間的li內容-> v-if 控制頁碼是當前頁碼則生成span標籤不給點擊，反之v-else 生成a標籤可點擊其他頁碼 
//     `<nav aria-label="Page navigation example">
//       <ul class="pagination">
//         <li class="page-item" :class="{'disabled': pages.current_page === 1 }">
//           <a class="page-link" href="#" aria-label="Previous" @click.prevent="emitPages(pages.current_page - 1)">
//             <span aria-hidden="true">&laquo;</span>
//           </a>
//         </li>
//         <li class="page-item" v-for="( item, index) in pages.total_pages" :key="index">
//           <span class="page-link" v-if="item === pages.current_page">{{ item }}</span> 
//           <a class="page-link" href="#" v-else @click.prevent="emitPages(item)">{{item}}</a>
//         </li>
//         <li class="page-item" :class="{'disabled': pages.current_page === pages.total_pages }">
//           <a class="page-link" href="#" aria-label="Next" @click.prevent="emitPages(pages.current_page + 1)">
//             <span aria-hidden="true">&raquo;</span>
//           </a>
//         </li>
//       </ul>
//     </nav>`
// })

app.mount('#app');

