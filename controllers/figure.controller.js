import Figure from "../models/Figure.js";

export const createFigure = async (req, res) => {
  const user = req.userId;
  const { title, description, category, images, price, stock, userId } =
    req.body;
  try {
    const figure = await Figure.create({
      title,
      description,
      category,
      images,
      price,
      stock,
      userId: user,
    });
    await figure.save();
    res.status(201).json({ message: "Figure created successfully", figure });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create figure" });
  }
};

export const updateFigure = async (req, res) => {
  try {
  } catch (err) {
    console.log("");
  }
};
export const listFigures = async (req, res) => {
  try {
    console.log("Listing figures with filters:", req.query);

    // Извличане на параметрите за пагинация
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Създаване на филтър обект
    const filter = {};

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.title) {
      filter.title = { $regex: req.query.title, $options: "i" };
    }

    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice)
        filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice)
        filter.price.$lte = parseFloat(req.query.maxPrice);
    }

    if (req.query.minRating) {
      filter.rating = { $gte: parseFloat(req.query.minRating) };
    }

    console.log("Applied filters:", filter);

    // Извличане на общия брой резултати
    const total = await Figure.countDocuments(filter);

    // Извличане на филтрираните фигури с пагинация
    const figures = await Figure.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    console.log(
      `Found ${total} figures, returning page ${page} with ${figures.length} items`
    );

    res.status(200).json({
      figures,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    });
  } catch (err) {
    console.log("Error in listFigures:", err);
    res.status(500).json({ message: "Failed to fetch figures" });
  }
};
export const detailsFigure = async (req, res) => {
    const id = req.params.id
  try {
    const figure =await Figure.findById(id)
    if (!figure) res.status(404).json({message: "Figure not found"})
    res.status(200).json({figure})
  } catch (err) {
    console.log(err);
    res.status(500).json({message: "Failed to fetch figure"})
  }
};
export const deleteFigure = async (req,res) => {}
