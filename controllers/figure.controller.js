import Figure from "../models/Figure.js";

export const createFigure = async (req, res) => {
  const user = req.userId;
  const { title, description, category, images, price, stock } = req.body;
  
  try {
    
    const figure = new Figure({
      title,
      description,
      category,
      images,
      price,
      stock,
      userId: user,
      rating: {
        averageRating: 0,
        userRatings: new Map()
      },
      favorites: []
    });

    await figure.save();
    
    res.status(201).json({ 
      message: "Figure created successfully", 
      figure: figure.toObject() 
    });
  } catch (err) {
    console.log("Error creating figure:", err);
    res.status(500).json({ message: "Failed to create figure" });
  }
};

export const updateFigure = async (req, res) => {
  const figureId = req.params.id;
  const userId = req.userId;
  const { title, description, category, images, price, stock } = req.body;

  try {
    
    const figure = await Figure.findById(figureId);
    
    if (!figure) return res.status(404).json({ message: "Figure not found" });
    

    // Check if user is the owner
    if (figure.userId.toString() !== userId) return res.status(403).json({ message: "Not authorized to update this figure" });

    const updatedFigure = await Figure.findByIdAndUpdate(
      figureId,
      {
        $set: {
          ...(title && { title }),
          ...(description && { description }),
          ...(category && { category }),
          ...(images && { images }),
          ...(price && { price }),
          ...(typeof stock !== "undefined" && { stock })
        }
      },
      { new: true }
    );


    res.status(200).json({
      message: "Figure updated successfully",
      figure: updatedFigure
    });

  } catch (err) {
    console.log("Error in updateFigure:", err);
    res.status(500).json({ message: "Failed to update figure" });
  }
};

export const listFigures = async (req, res) => {
  try {
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Sort configuration
    let sortOption = {};
    const sortBy = req.query.sortBy || "createdAt"; // default sort by creation date
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    // Define sorting options
    switch (sortBy) {
      case "rating":
        sortOption = { "rating.averageRating": sortOrder };
        break;
      case "price":
        sortOption = { price: sortOrder };
        break;
      case "title":
        sortOption = { title: sortOrder };
        break;
      default:
        sortOption = { createdAt: sortOrder };
    }


    // Create filter object
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.title) filter.title = { $regex: req.query.title, $options: "i" };
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }

    const total = await Figure.countDocuments(filter);

    const figures = await Figure.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    const figuresWithStats = figures.map(figure => ({
      ...figure,
      ratingStats: {
        averageRating: figure.rating?.averageRating || 0,
        totalRatings: figure.rating?.userRatings ? Object.keys(figure.rating.userRatings).length : 0
      }
    }));


    res.status(200).json({
      figures: figuresWithStats,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      }
    });
  } catch (err) {
    console.log("Error in listFigures:", err);
    res.status(500).json({ 
      message: "Failed to fetch figures",
      error: err.message 
    });
  }
};
export const detailsFigure = async (req, res) => {
  const id = req.params.id;

  try {
    const figure = await Figure.findById(id);
    if (!figure) {
      return res.status(404).json({ message: "Figure not found" });
    }

    // Calculate rating statistics
    const ratings = Array.from(figure.rating.userRatings.values());
    const ratingStats = {
      averageRating: figure.rating.averageRating,
      totalRatings: ratings.length,
    };


    res.status(200).json({
      figure: {
        ...figure.toObject(),
        ratingStats,
      },
    });
  } catch (err) {
    console.log("Error in detailsFigure:", err);
    res.status(500).json({ message: "Failed to fetch figure" });
  }
};

export const deleteFigure = async (req, res) => {
  const figureId = req.params.id;
  const userId = req.userId;

  try {
    const figure = await Figure.findById(figureId);
    
    if (!figure) {
      return res.status(404).json({ message: "Figure not found" });
    }

    if (figure.userId.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this figure" });
    }

    await Figure.findByIdAndDelete(figureId);

    res.status(200).json({ 
      message: "Figure successfully deleted"
    });

  } catch (err) {
    console.log("Error in deleteFigure:", err);
    res.status(500).json({ 
      message: "Failed to delete figure",
      error: err.message 
    });
  }
};

export const rateFigure = async (req, res) => {
  const figureId = req.params.id;
  const userId = req.userId;
  const { rating } = req.body;

  try {

    const figure = await Figure.findById(figureId);
    if (!figure) {
      return res.status(404).json({ message: "Figure not found" });
    }

    if (!figure.rating) {
      figure.rating = {
        averageRating: 0,
        userRatings: new Map()
      };
    }

    if (!(figure.rating.userRatings instanceof Map)) {
      figure.rating.userRatings = new Map(Object.entries(figure.rating.userRatings));
    }

    figure.rating.userRatings.set(userId.toString(), rating);

    const ratings = Array.from(figure.rating.userRatings.values());
    const averageRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    figure.rating.averageRating = Number(averageRating.toFixed(1));


    await figure.save();
    
    res.status(200).json({
      message: "Rating updated successfully",
      averageRating: figure.rating.averageRating,
      totalRatings: ratings.length
    });
  } catch (err) {
    console.log("Error in rateFigure:", err);
    res.status(500).json({ message: "Failed to update rating" });
  }
};


export const toggleFavorite = async (req, res) => {
  const figureId = req.params.id;
  const userId = req.userId;

  try {

    const figure = await Figure.findById(figureId);
    if (!figure) {
      return res.status(404).json({ message: "Figure not found" });
    }

    const favoriteIndex = figure.favorites.indexOf(userId);
    
    if (favoriteIndex === -1) {
      // Add to favorites
      figure.favorites.push(userId);
    } else {
      // Remove from favorites
      figure.favorites.splice(favoriteIndex, 1);
    }

    await figure.save();

    res.status(200).json({
      message: favoriteIndex === -1 ? "Added to favorites" : "Removed from favorites",
      isFavorite: favoriteIndex === -1,
      favoritesCount: figure.favorites.length
    });

  } catch (err) {
    console.log("Error in toggleFavorite:", err);
    res.status(500).json({ message: "Failed to update favorites" });
  }
};
export const getFavorites = async (req, res) => {
  const userId = req.userId;

  try {

    const favorites = await Figure.find({
      favorites: userId
    }).lean();

    const favoritesWithStats = favorites.map(figure => ({
      ...figure,
      ratingStats: {
        averageRating: figure.rating?.averageRating || 0,
        totalRatings: figure.rating?.userRatings ? Object.keys(figure.rating.userRatings).length : 0
      }
    }));

    res.status(200).json({
      message: "Favorites retrieved successfully",
      favorites: favoritesWithStats
    });

  } catch (err) {
    console.log("Error in getFavorites:", err);
    res.status(500).json({ 
      message: "Failed to fetch favorites",
      error: err.message 
    });
  }
};
export const getMyFigures = async (req, res) => {
  const userId = req.userId;

  try {
    const figures = await Figure.find({ userId: userId }).lean();

    const figuresWithStats = figures.map(figure => ({
      ...figure,
      isFavorite: figure.favorites.includes(userId),
      stats: {
        favoritesCount: figure.favorites.length,
        averageRating: figure.rating?.averageRating || 0,
        totalRatings: figure.rating?.userRatings ? Object.keys(figure.rating.userRatings).length : 0
      }
    }));

    res.status(200).json({
      message: "User figures retrieved successfully",
      figures: figuresWithStats
    });

  } catch (err) {
    console.log("Error in getMyFigures:", err);
    res.status(500).json({ 
      message: "Failed to fetch user figures",
      error: err.message 
    });
  }
};