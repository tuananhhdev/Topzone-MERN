import Brand from "../models/brands.model";
import Category from "../models/categories.model";
import Product from "../models/products.model";
import createError from "http-errors";
import { buildSlug } from "../helpers/buildSlug";

class ProductsService {
  async findProductBySlug(slug: string) {
    const product = await Product.findOne({
      slug: slug,
    })
      .populate("category", "category_name slug")
      .populate("brand", "brand_name slug");
    if (!product) {
      throw createError(400, "Product Not Found");
    }
    return product;
  }

  async getAllByBrandSlug(slug: string, query: any) {
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const offset = (page - 1) * limit;

    let objSort: any = { createdAt: -1 };

    if (query.sort) {
      switch (query.sort) {
        case "gia-thap-den-cao":
          objSort = { price_end: 1 };
          break;
        case "gia-cao-den-thap":
          objSort = { price_end: -1 };
          break;
        case "noi-bat":
          objSort = { is_featured: -1, createdAt: -1 };
          break;
        default:
          objSort = { createdAt: -1 };
      }
    }

    let objectFilters: any = {};

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

    if (query.os && query.os != "") {
      const osList = query.os.split(",");
      objectFilters = {
        ...objectFilters,
        "specification.operating_system": { $in: osList },
      };
    }

    if (query.max_price && query.max_price != "") {
      objectFilters = { ...objectFilters, price_end: { $lte: query.max_price } };
    }
    if (query.min_price && query.min_price != "") {
      objectFilters = { ...objectFilters, price_end: { $gte: query.min_price } };
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
        match: { slug: slug },
      })
      .populate("category", "category_name")
      .populate("specification")
      .sort(objSort)
      .lean();

    const products = productsAll.filter((b) => b.brand);
    const paginatedProducts = products.slice(offset, offset + limit);

    return {
      products_list: paginatedProducts,
      sorts: objSort,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(products.length / limit),
        totalRecords: products.length,
      },
    };
  }

  async getAllByCategorySlug(slug: string, query: any) {
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const offset = (page - 1) * limit;

    let objSort: any = { createdAt: -1 };

    if (query.sort) {
      switch (query.sort) {
        case "gia-thap-den-cao":
          objSort = { price_end: 1 };
          break;
        case "gia-cao-den-thap":
          objSort = { price_end: -1 };
          break;
        case "noi-bat":
          objSort = { is_featured: -1, createdAt: -1 };
          break;
        default:
          objSort = { createdAt: -1 };
      }
    }

    let objectFilters: any = {};

    if (query.os && query.os != "") {
      const osList = query.os.split(",");
      objectFilters = {
        ...objectFilters,
        "specification.operating_system": { $in: osList },
      };
    }

    if (query.max_price && query.max_price != "") {
      objectFilters = { ...objectFilters, price_end: { $lte: query.max_price } };
    }
    if (query.min_price && query.min_price != "") {
      objectFilters = { ...objectFilters, price_end: { $gte: query.min_price } };
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
        path: "category",
        select: "category_name slug",
        match: { slug: slug },
      })
      .populate("brand", "brand_name")
      .populate("specification")
      .sort(objSort)
      .lean();

    const products = productsAll.filter((c) => c.category);
    const paginatedProducts = products.slice(offset, offset + limit);

    return {
      products_list: paginatedProducts,
      sorts: objSort,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(products.length / limit),
        totalRecords: products.length,
      },
    };
  }

  async findAllProduct(query: any) {
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const offset = (page - 1) * limit;

    let objectFilters: any = {};
    if (query.category) objectFilters.category = query.category;
    if (query.brand) objectFilters.brand = query.brand;
    if (query.keyword)
      objectFilters.product_name = new RegExp(query.keyword, "i");

    if (query.brands || query.categories) {
      const [brands, categories] = await Promise.all([
        query.brands
          ? Brand.find({ slug: { $in: query.brands.split(",") } }).select("_id")
          : [],
        query.categories
          ? Category.find({ slug: { $in: query.categories.split(",") } }).select(
              "_id"
            )
          : [],
      ]);

      const brandIds = brands.map((b) => b._id);
      const categoryIds = categories.map((c) => c._id);

      if (brandIds.length) objectFilters.brand = { $in: brandIds };
      if (categoryIds.length) objectFilters.category = { $in: categoryIds };
    }

    if (query.min_price && query.max_price) {
      objectFilters.price_end = {
        $gte: parseInt(query.min_price as string),
        $lte: parseInt(query.max_price as string),
      };
    }

    let objSort: any = { createdAt: -1 };

    if (query.sort) {
      switch (query.sort) {
        case "gia-thap-den-cao":
          objSort = { price_end: 1 };
          break;
        case "gia-cao-den-thap":
          objSort = { price_end: -1 };
          break;
        default:
          objSort = { createdAt: -1 };
      }
    }

    const allProducts = await Product.find(objectFilters)
      .select("-__v -id")
      .populate("category", "category_name")
      .populate("brand", "brand_name")
      .populate("specification")
      .sort(objSort)
      .lean();

    const paginatedProducts = allProducts.slice(offset, offset + limit);

    return {
      products_list: paginatedProducts,
      sorts: objSort,
      filters: objectFilters,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(allProducts.length / limit),
        totalRecords: allProducts.length,
      },
    };
  }

  async findOneProductId(id: string) {
    const product = await Product.findById(id, "-__v -id")
      .populate("category", "category_name")
      .populate("brand", "brand_name");

    if (!product) {
      throw createError(400, "Product not found");
    }
    return product;
  }

  async createProduct(data: any) {
    if (!data.slug) {
      data.slug = buildSlug(data.product_name);
    }

    const product = await Product.create(data);
    return product;
  }

  async updateProduct(id: string, data: any) {
    const product = await this.findOneProductId(id);
    Object.assign(product, data);
    await product.save();
    return product;
  }

  async deleteProduct(id: string) {
    const product = await this.findOneProductId(id);
    await Product.deleteOne({ _id: product._id });
    return product;
  }
}

export default new ProductsService();
