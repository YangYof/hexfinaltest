
// Api Url
const haxApi = `https://livejs-api.hexschool.io`;
const apiPath = 'yyang';

// DOM
const productList = document.querySelector('.productWrap');
const cartList = document.querySelector('.js-shoppingCart');
const productSelect = document.querySelector('.productSelect');

let cartsData = [];
let productData = [];

//產品列表
const getProducts = ()=> {
    axios.get(`${haxApi}/api/livejs/v1/customer/${apiPath}/products`)
    .then((res)=>{
        // console.log(res);
        productData = res.data.products;
        // console.log(productData)
        renderProduct(productData);
        selectProducts(productData);
        searchProduuct(productData);
        filterProduct(productData);
    });
};

const renderProduct = (products)=> {
    let str = '';
    // console.log(products);
    products.forEach((item,index)=>{
        str += `
            <li class="productCard">
                <h4 class="productType">${item.category}</h4>
                <img src="${item.images}" alt="">
                <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
                <h3>${item.title}</h3>
                <del class="originPrice">NT$${item.origin_price}</del>
                <p class="nowPrice">NT$${item.price}</p>
            </li>
        `
    })
    productList.innerHTML = str;
};
const selectProducts = (products)=>{
    let str = `<option value="全部" selected>全部</option>`;
    let unsort = products.map(item=>item.category);
    let sorted = unsort.filter(function(item, index){
        return unsort.indexOf(item)===index;
    });
    sorted.forEach(item=>str+=`<option value="${item}">${item}</option>`)
    productSelect.innerHTML = str;
};
const filterProduct = (products)=> {
    productSelect.addEventListener('change', function(e){
        let categoryProducts = products.filter(function(item,index){
            return item.category === e.target.value;
        });
        e.target.value == '全部' ? renderProduct(products) : renderProduct(categoryProducts) ;
    })
};
const searchProduuct = (products)=>{
    const searchBtn = document.querySelector('.searchBtn');
    const searchInput = document.querySelector('.searchInput');
    searchBtn.addEventListener('click', function(e){
        let keyword = searchInput.value.trim().toLowerCase();
        let fp = products.filter((item, index)=>{
            let title = item.category.trim().toLowerCase();
            return title.match(keyword);
        });
        renderProduct(fp);
    })
};


//購物車列表
const getCarts = ()=>{
    axios.get(`${haxApi}/api/livejs/v1/customer/${apiPath}/carts`)
    .then((res)=>{
        // console.log(res);
        cartsData = res.data.carts;
        let finalTotal = res.data.finalTotal;
        // console.log(cartsData);
        // console.log(finalTotal);
        renderCarts(cartsData, finalTotal);
        changeCartQty(cartsData);
    });
};

const addcartApi = (cartData)=>{
    axios.post(`${haxApi}/api/livejs/v1/customer/${apiPath}/carts`,{data: cartData })
    .then((res)=>{
        // console.log(res);
        getCarts();
    });
};

productList.addEventListener('click', function(e){
    e.preventDefault();
    let cartData = {};
    let itemNum = 1 ;
    cartData['productId'] = e.target.getAttribute('data-id'); 
    cartsData.forEach((item)=>{
        cartData['productId'] == item.product.id ? itemNum = item.quantity+=1 : false ;
    });
    cartData['quantity'] = itemNum;
    addcartApi(cartData);
});
const renderCarts = (carts, total)=>{
    let str = '';
    carts.forEach(function(item){
        str +=`
            <tr >
                <td>
                    <div class="cardItem-title">
                        <img src="${item.product.images}" alt="">
                        <p>${item.product.title}</p>
                    </div>
                </td>
                <td>NT$${item.product.price}</td>
                <td>
                    <p class="cartAmount">
                        <a href="#"><span class="material-icons cartAmount-icon" data-id="${item.id}" data-num="${item.quantity-1}">remove</span></a>
                        <span>${item.quantity}</span>
                        <a href="#"><span class="material-icons cartAmount-icon" data-id="${item.id}" data-num="${item.quantity+1}">add</span></a>
                    </p>
                </td>
                <td>NT$${item.product.price}</td>
                <td class="discardBtn">
                    <a href="#" class="material-icons" data-btn="1" data-id="${item.id}">
                        clear
                    </a>
                </td>
            </tr>
        `
    })
    cartList.innerHTML = str;
    document.querySelector('.finalTotal').innerHTML = `${total}`;
};

cartList.addEventListener('click', function(e){
    e.preventDefault();
    if(e.target.getAttribute('data-btn')!=='1'){
        return ;
    }
    let id = e.target.getAttribute('data-id');
    delcartApi(id);
})
const delcartApi = (id)=>{
    axios.delete(`${haxApi}/api/livejs/v1/customer/${apiPath}/carts/${id}`)
    .then((res)=>{
        // console.log(res);
        getCarts();
    });
};

const discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener('click', function(e){
    e.preventDefault();
    axios.delete(`${haxApi}/api/livejs/v1/customer/${apiPath}/carts`)
    .then((res)=>{
        console.log(res);
        getCarts();
    });
});

const changeCartQty = (carts)=>{
    const changeBtn = document.querySelectorAll(".cartAmount");
    // console.log(changeBtn);
    changeBtn.forEach((item)=>{
        item.addEventListener('click', function(e){
            let id = e.target.getAttribute('data-id');
            let qty = e.target.getAttribute('data-num');
            qty <= 0 ? delcartApi(id) : changeNumApi(id, qty);
        });
    });
};

const changeNumApi = (id, qty)=>{
    let item = {};
    item['id'] = id;
    item['quantity'] = Number(qty);
    axios.patch(`${haxApi}/api/livejs/v1/customer/${apiPath}/carts`, {data:item})
    .then((res)=>{
        // console.log(res);
        getCarts();
    });
};

// 訂單
// {
//     "data": {
//       "user": {
//         "name": "六角學院",
//         "tel": "07-5313506",
//         "email": "hexschool@hexschool.com",
//         "address": "高雄市六角學院路",
//         "payment": "Apple Pay"
//       }
//     }
// }
const formOrder = document.querySelector('.orderInfo-form');
const resetInput = ()=>{
    document.querySelector('#customerName').value = '';
    document.querySelector('#customerPhone').value = '';
    document.querySelector('#customerEmail').value = '';
    document.querySelector('#customerAddress').value = '';
    document.querySelector('#tradeWay').value = 'ATM';
};
const validata = ()=>{
    let constraints ={
        '姓名':{
            presence:{
                message:'必填',
            }
        },
        '電話':{
            presence:{
                message:'必填',
            }
        },
        'Email':{
            presence:{
                message:'必填',
            },
            email:{
                message:'格式錯誤'
            }
        },
        '寄送地址':{
            presence:{
                message:'必填',
            }
        },
    };
    
    let inputs = document.querySelectorAll('input[type=text],input[type=email],input[type=tel]');
    inputs.forEach((item)=>{
        item.addEventListener('change', function(e){
            let errors = validate(formOrder, constraints);
            if(errors){
                Object.keys(errors).forEach((keys)=>{
                    console.log(document.querySelector(`p[data-message="${keys}"]`));
                    document.querySelector(`p[data-message="${keys}"]`).innerHTML = errors[keys];
                })
            }
        })
        
    })
}
formOrder.addEventListener('submit', function(e){
    e.preventDefault();
    let user = {};
    user['name'] = document.querySelector('#customerName').value;
    user['tel'] = document.querySelector('#customerPhone').value;
    user['email'] = document.querySelector('#customerEmail').value;
    user['address'] = document.querySelector('#customerAddress').value;
    user['payment'] = document.querySelector('#tradeWay').value;
    validata();
    sendOrder(user)
});

const sendOrder = (user)=>{
    axios.post(`${haxApi}/api/livejs/v1/customer/${apiPath}/orders`,{data:{user}})
    .then((res)=>{
        // console.log(res);
        getCarts();
        resetInput();
    });
};
const init = ()=> {
    getCarts();
    getProducts();
};

init();