var express = require("express")
var router = express.Router()

// import database
var connection = require('../library/database')

// index post
router.get('/main', function (req, res, next){
    // query
    connection.query('SELECT * FROM product ORDER BY id desc', function(err, rows){
        if (err){
            req.flash('error', err);
            res.render('main', {
                data: '',
                username: req.session.username,
                role: req.session.role
            });
        } else {
            // render
            res.render('main', {
                data: rows,
                username: req.session.username,
                role: req.session.role
            });
        }
    });
});

router.get("/makanan", function(req, res) {
    connection.query('SELECT * FROM product WHERE jenis = "makanan" ORDER BY id desc',  function(err, rows) {
        if (err){
            req.flash('error', err);
            res.render('main', {
                data: '',
                username: req.session.username,
                role: req.session.role
            });
        } else {
            // render
            res.render('main', {
                data: rows,
                username: req.session.username,
                role: req.session.role
            });
        }
    })
})

router.get("/minuman", function(req, res) {
    connection.query('SELECT * FROM product WHERE jenis = "minuman" ORDER BY id desc',  function(err, rows) {
        if (err){
            req.flash('error', err);
            res.render('main', {
                data: '',
                username: req.session.username,
                role: req.session.role
            });
        } else {
            // render
            res.render('main', {
                data: rows,
                username: req.session.username,
                role: req.session.role
            });
        }
    })
});

// logout
router.get('/logout', function(req, res) {
    req.session.destroy();
    res.redirect('/main');
})

// create
router.get('/create', function(req, res) {
    res.render('create',{
        nama:'',
        harga:'',
        image:'',
        jenis:''
    });
});

// upload image
const multer = require('multer')
var fs = require('fs')

const storage =  multer.diskStorage({
    destination : (req, res, cb) => {
        cb(null, 'public/images')
    },

    filename: (req, file, cb) => {
        console.log(file);
        cb(null, file.originalname)
    }
});
const upload = multer({storage : storage})

// store data
router.post('/store', upload.single('image'), function (req, res, next){
    let namaProduk = req.body.nama;
    let hargaProduk = req.body.harga;
    let jenisProduk = req.body.jenis;
    let image = req.file.originalname
    
    let errors = false;

    if(namaProduk.length === 0 || hargaProduk.length === 0 || jenisProduk.length === 0){
        errors = true;

        req.flash('error', 'Please enter data correctly');
        res.render('create', {
            nama: namaProduk,
            harga: hargaProduk,
            jenis: jenisProduk,
            image: image
        });
    }
    
    // Push data
    if(!errors){
        let formData = {
            nama: namaProduk,
            harga: hargaProduk,
            jenis: jenisProduk,
            image: image
        }

        connection.query(
            `INSERT INTO product SET ?`,
            formData,
            function (err, result) {
                if (err){
                    req.flash('error', err)

                    res.render('create', {
                        nama: namaProduk,
                        harga: hargaProduk,
                        jenis: jenisProduk,
                        image: image
                    })
                } else {
                    req.flash('succes', 'Product data has been save');
                    res.redirect(`/main`);
                }
            }
        )
    }
});

// delete
router.get("/delete/:id", function(req, res, next){
    let idData = req.params.id

    connection.query(
        `SELECT image FROM product WHERE id = ${idData}`,
        function(err, result){
            if(err){
                req.flash('error', 'Data not found');
                res.redirect(`/main`)
            } else {
                let imageName = result[0].image

                if(imageName){
                    fs.unlinkSync("public/images/" + imageName)
                }

                var deleteData = `DELETE FROM product WHERE id = ${idData}`;
                connection.query(deleteData, function(err, result){
                if(err){
                    req.flash("error", "Sorry data can't be deleted")
                    req.redirect(`/main`)
                }else{
                    req.flash("succes", "Data succesfully deleted")
                    res.redirect(`/main`)
            }
        });    
    }
    }
    )    
});

// Edit 
router.get('/edit/:idData', function(req, res , next){
    let idData = req.params.idData

    connection.query(`SELECT * FROM product WHERE id = ${idData}`, 
    function(err, rows, fields){
        if(err) throw err

        // jika tidak ditemukan
        if(rows.length <= 0){
            req.flash('error', `Data with ID ${idData} not found`)
            res.redirect(`/main`)
        }else{
            res.render('edit', {
                id: rows[0].id,
                nama: rows[0].nama,
                jenis: rows[0].jenis,
                harga: rows[0].harga,
                image: rows[0].image
            });
        }
    });
});

// update
router.post(
    "/update/:idData",
    upload.single("image"),
    function (req, res, next) {
      let idData = req.params.idData;
      let namaProduk = req.body.nama;
      let jenisProduk = req.body.jenis;
      let hargaProduk = req.body.harga;
      let image = req.body.image;
  
      let errors = false;
  
      // Validasi
      if (namaProduk.length === 0 || jenisProduk.length === 0 || hargaProduk.length === 0) {
        errors = true;
  
        req.flash('error', 'Try again');
        res.render('edit', {
          nama: namaProduk,
          jenis: jenisProduk,
          harga: hargaProduk,
          image: image
        });
      }
  
      if (!errors) {
        connection.query(
          `SELECT image FROM product WHERE id = ${idData}`,
          function (err, results) {
            if (err) {
              req.flash("error", err);
              res.render('edit', {
                nama: namaProduk,
                jenis: jenisProduk,
                harga: hargaProduk,
                image: image
              });
            } else {
              let previousImage = results[0].image;
  
              if (previousImage) {
                fs.unlinkSync('public/images/' + previousImage);
              }
  
              let formData = {
                nama: namaProduk,
                jenis: jenisProduk,
                harga: hargaProduk,
                image: image
              };
  
              if (req.file) {
                formData.image = req.file.originalname;
              }
  
              connection.query(
                `UPDATE product SET ? WHERE id = ${idData}`,
                formData,
                function (err, result) {
                  if (err) {
                    req.flash('error', err);
                    res.render('edit', {
                        nama: namaProduk,
                        jenis: jenisProduk,
                        harga: hargaProduk,
                        image: image
                    });
                  } else {
                    req.flash('success', 'Data succesfully edited');
                    res.redirect(`/main`);
                  }
                }
              );
            }
          }
        );
      }
    }
  );

router.get('/detail/:idData', function(req, res) {
    let idData = req.params.idData
    connection.query(`SELECT * FROM product WHERE id = ${idData}`, function(err, rows){
        if (err){
            req.flash('error', err);
            res.redirect('/main');
        } else {
            // render
            res.render('detail', {
                nama: rows[0].nama,
                jenis: rows[0].jenis,
                harga: rows[0].harga,
                image: rows[0].image
            });
        }
    });
  });

module.exports = router;