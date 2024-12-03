import Brand from "../models/brands.model";
import Category from "../models/categories.model";
import Product from "../models/products.model";
import createError from "http-errors";

const findProductBySlug = async (slug: string) => {
  const product = await Product.findOne({
    slug: slug,
  });
  if (!product) {
    throw createError(400, "Product Not Found");
  }
  return product;
};


const getAllByBrandSlug = async (slug: string, query: any) => {
  /* Phân trang */
  const page_str = query.page;
  const limit_str = query.limit;

  const page = page_str ? parseInt(page_str as string) : 1;
  const limit = limit_str ? parseInt(limit_str as string) : 10;

  /* Sắp xếp */
  let objSort: any = {};
  const sortBy = query.sort || "createdAt"; // Mặc định sắp xếp theo ngày tạo giảm dần
  const orderBy = query.order && query.order == "ASC" ? 1 : -1;
  objSort = { ...objSort, [sortBy]: orderBy }; // Thêm phần tử sắp xếp động vào object {}

  const offset = (page - 1) * limit;

  /* Lọc theo từng điều kiện */

  let objectFilters: any = {};
  //Lọc sản phẩm theo categories
  if (query.categories && query.categories != "") {
    const categorySlugs = query.categories.split(",");
    const categories = await Category.find({
      slug: { $in: categorySlugs },
    }).select("_id");
    if (categories.length > 0) {
      const categoryIds = categories.map((category) => category._id);
      objectFilters = { ...objectFilters, category: { $in: categoryIds } };
    }
  }

  if (query.max_price && query.max_price != "") {
    const max_price = query.max_price;
    objectFilters = { ...objectFilters, price_end: { $lte: max_price } };
  }
  if (query.min_price && query.min_price != "") {
    const min_price = query.min_price;
    objectFilters = { ...objectFilters, price_end: { $gte: min_price } };
  }
  if (query.price && query.price != "") {
    const price = query.price.split("-");
    objectFilters = {
      ...objectFilters,
      price_end: { $gte: price[0], $lte: price[1] },
    };
  }

  const productsAll = await Product.find({ ...objectFilters })
    .populate({
      path: "brand",
      select: "brand_name",
      match: {
        slug: slug,
      },
    })
    .populate("category", "category_name")
    .sort(objSort);

  const products = productsAll.filter((b) => b.brand);

  const paginatedProducts = products.slice(offset, offset + limit);

  const totalRecords = products.length;

  return {
    products_list: paginatedProducts,
    sorts: objSort,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(products.length / limit), //tổng số trang
      totalRecords,
    },
  };
};

const getAllByCategorySlug = async (slug: string, query: any) =>{
    /* Phân trang */
    const page_str = query.page;
    const limit_str = query.limit;

    const page = page_str ? parseInt(page_str as string) : 1;
    const limit = limit_str ? parseInt(limit_str as string) : 10;

    /* Sắp xếp */
    let objSort: any = {};
    const sortBy = query.sort || 'createdAt'; // Mặc định sắp xếp theo ngày tạo giảm dần
    const orderBy = query.order && query.order == 'ASC' ? 1 : -1
    objSort = { ...objSort, [sortBy]: orderBy } // Thêm phần tử sắp xếp động vào object {}

    const offset = (page - 1) * limit;

    /* Lọc theo từng điều kiện */
    
    let objectFilters : any = {};
    // Lọc sản phẩm theo thương hiệu
    if(query.brands && query.brands != ''){
        const brandSlugs = query.brands.split(',')
        const brands = await Brand.find({ slug: { $in: brandSlugs } }).select('_id');
        if (brands.length > 0){
            const brandIds = brands.map(brand => brand._id);
            objectFilters = {...objectFilters, brand: { $in: brandIds }}
        }
        
    }

    // Lọc sản phẩm theo giá
    if(query.max_price && query.max_price != ''){
        const max_price = query.max_price
        objectFilters = {...objectFilters, price_end: { $lte : max_price}}
    }
    if(query.min_price && query.min_price != ''){
        const min_price = query.min_price
        objectFilters = {...objectFilters, price_end: { $gte : min_price}}
    }
    if(query.price && query.price != ''){
        const price = query.price.split('-')
        objectFilters = {...objectFilters, price_end: { $gte: price[0], $lte: price[1] }}
    }

    const productsAll = await Product
    .find({...objectFilters})
    .populate({
        path: 'category',
        select: 'category_name',
        match: {
            slug: slug
        }
    })
    .populate('brand', 'brand_name')
    .sort(objSort)

    const products = productsAll.filter(c => c.category);

    const paginatedProducts = products.slice(offset, offset + limit);

    const totalRecords = products.length;
    
    return {
        products_list: paginatedProducts,
        sorts: objSort,
        pagination: {
            page,
            limit,
            totalPages: Math.ceil(products.length / limit), //tổng số trang
            totalRecords
        }
    }
}


/* get All Products */
const findAllProduct = async (query: any) => {
    /* Phân trang */
    const page_str = query.page;
    const limit_str = query.limit;

    const page = page_str ? parseInt(page_str as string) : 1;
    const limit = limit_str ? parseInt(limit_str as string) : 10;

    /* Lọc theo từng điều kiện */
    
    let objectFilters : any = {};
    // Lọc theo danh mục sản phẩm
    if(query.category && query.category != ''){
        objectFilters = {...objectFilters, category: query.category}
    }
    if(query.brand && query.brand != ''){
        objectFilters = {...objectFilters, brand: query.brand}
    }
    // Lọc theo danh tên sản phẩm
    if(query.keyword && query.keyword != ''){
        objectFilters = {...objectFilters, product_name: new RegExp(query.keyword, 'i')}
    }

    // Lọc sản phẩm theo thương hiệu
    if(query.brands && query.brands != ''){
        const brandSlugs = query.brands.split(',')
        const brands = await Brand.find({ slug: { $in: brandSlugs } }).select('_id');
        if (brands.length > 0){
            const brandIds = brands.map(brand => brand._id);
            objectFilters = {...objectFilters, brand: { $in: brandIds }}
        }
    }
    
    //Lọc sản phẩm theo categories
    if(query.categories && query.categories != ''){
        const categorySlugs = query.categories.split(',')
        const categories = await Category.find({ slug: { $in: categorySlugs } }).select('_id');
        if (categories.length > 0){
            const categoryIds = categories.map(category => category._id);
            objectFilters = {...objectFilters, category: { $in: categoryIds }}
        }
    }

    // Lọc sản phẩm theo giá
    if(query.max_price && query.max_price != ''){
        const max_price = query.max_price
        objectFilters = {...objectFilters, price_end: { $lte : max_price}}
    }
    if(query.min_price && query.min_price != ''){
        const min_price = query.min_price
        objectFilters = {...objectFilters, price_end: { $gte : min_price}}
    }
    if(query.price && query.price != ''){
        const price = query.price.split('-')
        objectFilters = {...objectFilters, price_end: { $gte: price[0], $lte: price[1] }}
    }



    /* Sắp xếp */
    let objSort: any = {};
    const sortBy = query.sort || 'createdAt'; // Mặc định sắp xếp theo ngày tạo giảm dần
    const orderBy = query.order && query.order == 'ASC' ? 1 : -1
    objSort = { ...objSort, [sortBy]: orderBy } // Thêm phần tử sắp xếp động vào object {}

    const offset = (page - 1) * limit;


    //Đếm tổng số record hiện có của collection Product
    const totalRecords = await Product.countDocuments(objectFilters);

    /* Select * FROM product */
    const products = await Product
        .find({
            ...objectFilters,
            //isDelete: false // Chỉ lấy những sp chưa xóa
        })
        .select('-__v -id')
        .populate('category', 'category_name')
        .populate('brand', 'brand_name')
        .sort(objSort)
        .skip(offset)
        .limit(limit)
        .lean({ virtuals: true });

    return {
        products_list: products,
        sorts: objSort,
        filters: objectFilters,
        // Phân trang
        pagination: {
            page,
            limit,
            totalPages: Math.ceil(totalRecords / limit), //tổng số trang
            totalRecords
        }
    }
}

//  * get Single Product by ID
const findOneProductId = async (id: string) => {
    const product = await Product
        .findById(id, '-__v -id') // có thể liệt kê select vào tham số thứ 2 của hàm
        .populate('category', 'category_name')
        .populate('brand', 'brand_name')
    //Check sự tồn tại
    if (!product) {
        throw createError(400, 'Product not found')
    }
    return product
}
// * create new Product
const createNewProduct = async (body: any) => {
    const payloads = {
        product_name: body.product_name,
        price: body.price,
        discount: body.discount,
        category: body.category,
        brand: body.brand,
        model_year: body.model_year,
        description: body.description,
        thumbnail: body.thumbnail,
        stock: body.stock,
        slug: body.slug,
        order: body.order,
        isBest: body.isBest,
        isRecentlyAdded: body.isRecentlyAdded,
        isShowHome: body.isShowHome,
        isDelete: body.isDelete,
        specifications: body.specifications,
    }
    const product = await Product.create(payloads)
    return product
}
// * update Product
const updateProductById = async (id: string, payload: any) => {
    //b1. Kiểm tính tồn tại
    const product = await findOneProductId(id);
    //2. Update = cách ghi đè thuộc tính
    Object.assign(product, payload);
    await product.save();
    //3. Trả về kết quả
    return product
}
// delete product theo ID
const deleteProductById = async (id: string) => {
    //b1. Kiểm tính tồn tại
    const product = await findOneProductId(id);
    //2. xóa
    await Product.deleteOne({ _id: product._id });

    //3. Trả về kết quả
    return product
}
export default {
    findProductBySlug,
    getAllByBrandSlug,
    getAllByCategorySlug,
    findAllProduct,
    findOneProductId,
    createNewProduct,
    updateProductById,
    deleteProductById,  
}