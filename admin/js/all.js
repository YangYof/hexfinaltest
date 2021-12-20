

// Api Url
const haxApi = `https://livejs-api.hexschool.io`;
const apiPath = 'yyang';
const token = 'WMZOJbkBbyYtfacTYsbY3vjsnX93';

//DOM
const orderPage = document.querySelector('.orderPage-table');
// console.log(orderPage);
let orders = [];

const getOrders = ()=> {
    axios.get(
        `${haxApi}/api/livejs/v1/admin/${apiPath}/orders`,
        {headers:{'Authorization':token}}
        ).then((res)=>{
            // console.log(res);
            orders = res.data.orders;
            // console.log(orders);
            renderOrders(orders);
            orderStatus();
            delBtn();
            donutChartData(orders);
        })
};

const renderOrders = (orders)=>{
    let str = `
        <thead>
            <tr>
                <th>訂單編號</th>
                <th>聯絡人</th>
                <th>聯絡地址</th>
                <th>電子郵件</th>
                <th>訂單品項</th>
                <th>訂單日期</th>
                <th>訂單狀態</th>
                <th>操作</th>
            </tr>
        </thead>
    `
    // orders.forEach(function(item){
    //     str += `
    //         <tr>
    //             <td>10088377474</td>
    //             <td>
    //                 <p>${item.user.name}</p>
    //                 <p>${item.user.tel}</p>
    //             </td>
    //             <td>${item.user.address}</td>
    //             <td>${item.user.email}</td>
    //             <td class="js-orderProducts">
    //                 <p>Louvre 雙人床架</p>
    //             </td>
    //             <td>${ timestampToTime(item.createdAt)}</td>
    //             <td class="orderStatus">
    //                 ${item.paid ? `<a href="#" data-id="${item.id}" class="text-success">已處理</a>` : `<a href="#" data-id="${item.id}" class="text-danger">未處理</a>`}
    //             </td>
    //             <td>
    //                 <input type="button" data-id=${item.id} class="delSingleOrder-Btn" value="刪除">
    //             </td>
    //         </tr>
    //     `
    // });
    orders.map(item=>
        str += `<tr>
                    <td>10088377474</td>
                    <td>
                        <p>${item.user.name}</p>
                        <p>${item.user.tel}</p>
                    </td>
                    <td>${item.user.address}</td>
                    <td>${item.user.email}</td>
                    <td class="js-orderProducts">
                        <p>Louvre 雙人床架</p>
                    </td>
                    <td>${ timestampToTime(item.createdAt)}</td>
                    <td class="orderStatus">
                        ${item.paid ? `<a href="#" data-id="${item.id}" class="text-success">已處理</a>` : `<a href="#" data-id="${item.id}" class="text-danger">未處理</a>`}
                    </td>
                    <td>
                        <input type="button" data-id=${item.id} class="delSingleOrder-Btn" value="刪除">
                    </td>
                </tr>`).join('');
    orderPage.innerHTML = str;
    // ${item.paid ? <a href="#">已處理</a> : <a href="#">未處理</a>}
};

const orderStatus = ()=>{
    const status = document.querySelectorAll('.orderStatus');
    // console.log(status);
    status.forEach(function(item){
        item.addEventListener('click', function(e){
            e.preventDefault();
            console.log(e.target.getAttribute('data-id'));
            const id = e.target.getAttribute('data-id');
            const orderStatus = e.target.getAttribute('data-status');
            // console.log(orderStatus, item);
            // console.log(orderStatus);
            statusOrderApi(id, orderStatus);
        });
    })
};
// {
//     "data": {
//       "id": "訂單 ID (String)",
//       "paid": true
//     }
//   }
const statusOrderApi = (id)=>{
    let item = {};
    item['id'] = id;
    item['paid'] = true;
    // console.log(item);
    axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${apiPath}/orders`,
    {"data": {"id":id, "paid":true}},
    {headers: {'Authorization': token}})
    .then((res)=>{
        // console.log(res);       
        getOrders();
    })
    .catch(function (error) {
        console.log('錯誤',error);
    });
};

const delBtn = ()=>{
    const delBtn = document.querySelectorAll('.delSingleOrder-Btn');
    // console.log(delBtn);
    delBtn.forEach(function(item){
        item.addEventListener('click', function(e){
            let id = e.target.getAttribute('data-id');
            delOrder(id);
        })
    })
};

const delOrder = (id)=> {
    axios.delete(
        `${haxApi}/api/livejs/v1/admin/${apiPath}/orders/${id}`,
        {headers:{'Authorization':token}}
        ).then((res)=>{
            console.log(res);
            getOrders();
        })
};

const delAllOrder = ()=> {
    const discardAllBtn = document.querySelector('.discardAllBtn');
    discardAllBtn.addEventListener('click', function(e){
        e.preventDefault();
        axios.delete(`${haxApi}/api/livejs/v1/admin/${apiPath}/orders`,{headers:{'Authorization':token}})
        .then((res)=>{
            console.log(res);
            getOrders();
        })
    });
};



const init = ()=>{
    getOrders();
    delAllOrder();
};

init();


const donutChartData = (orders)=> {
    // console.log(orders);
    
    orders.forEach(function(item){
        // console.log(item);
        let category = item.products.map(function(item){
            return item.category
        });
        let qty = 0;
        let items = {};
        console.log(category[0]);
        category.forEach((item)=>{
            if(items[item] == undefined){
                items[item] = 1
            }else{
                items[item] += 1
            }
        });
        let newData = [];
        Object.keys(items).forEach((item)=>{
            let itemNum = [];
            itemNum.push(item);
            itemNum.push(items[item]);
            newData.push(itemNum);
        });
        c3Donut(newData);
    })
};

const c3Donut = (data)=>{
        const chart = c3.generate({
        data: {
            columns: data,
            type : 'donut',
        },
        donut: {
            title: "Iris Petal Width"
        }
    });
};

const timestampToTime=(timestamp)=>{
    var date = new Date(timestamp * 1000);
    Y = date.getFullYear() + '-';
    M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    D = date.getDate() + ' ';
    return Y+M+D;
}

