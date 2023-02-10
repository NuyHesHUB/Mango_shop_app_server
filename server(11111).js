const express=require("express");
const cors=require("cors");
const app=express();
const models=require("./models");
const port=8080;
const multer=require('multer')
//const upload=multer({dest:"uploads/"})
const upload=multer({
    storage: multer.diskStorage({
        destination:function(req, flie, cb){
            cb(null, "uploads/")
        },
        filename:function(req, file, cb){
            cb(null, file.originalname)//이렇게 하면 43fkdlgjlk43 이런파일명의 방식이 아니라 오리지날 파일이름으로 올라가는듯?
        }
    })
})

app.use(express.json()); //json 형식의 데이터를 처리할수 있게 설정
app.use(cors()); //브라우저의 cors이슈를 막기 위해 사용하는 코드
app.use("uploads",express.static("uploads"))

app.get('/products',  (req, res) => {
    models.Product.findAll({
        order:[['createdAt','DESC']],
        attributes:["id","name","price","seller","imageUrl", "createdAt"]
    })
    .then((result)=>{
        console.log('Product :', result);
        res.send({
            product: result,
        })
    }).catch((error)=>{
        console.error(error);
        res.send("에러발생")
    });
});
app.get("/products/:id", (req, res) => {
    const params=req.params;
    const {id} =params;
    models.Product.findOne({
        where:{
            id:id,
        }
    }).then((result)=>{
        console.log("product:", result);
        res.send({
            product: result
        })
    }).catch((error)=>{
        console.error();
        res.send('상품조회시 에러가 발생했습니다')
    });
})

app.post('/products', (req, res) => {
    
    const body=req.body;
    const {name, description, price, seller} =body;
    if(!name || !description || !price || !seller){
        res.send("모든 필드를 입력해주세요")
    }
    models.Product.create({
        name,
        description,
        price,
        seller
    }).then((result) =>{
        console.log('상품생성결과:', result);
        res.send({result,})
    }).catch((error) =>{
        console.error(error);
        res.send('상품 업로드에 문제가 생겼습니다.')
    })
    
});

app.post('/image',upload.single('image'),(req,res)=>{
    const file=req.file;
    console.log(file);
    res.send({
        imageUrl:file.path
    })
})

app.listen(port, () => {
    
    models.sequelize.sync()
    .then(()=>{
        console.log('DB 연결 성공');
    }).catch((err)=>{
        console.error(err);
        console.log('DB 연결 에러');
        process.exit();
    });
})