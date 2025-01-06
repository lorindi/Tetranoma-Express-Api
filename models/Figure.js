import mongoose from "mongoose";
import { type } from "os";

const figureSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 1,
    },
    description: {
      type: String,
      required: true,
      minlength: 5,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "film",
        "game",
        "comic",
        "fantasy",
        "miniatures",
        "sci-fi",
        "historical",
        "animals",
        "architecture",
        "educational",
        "decor",
      ],
    },
    images: {
      type: [String],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    stock: { type: Number, default: 0 },
    rating: {
      averageRating: { 
        type: Number, 
        default: 0 
      },
      userRatings: {
        type: Map,
        of: Number,
        default: new Map()
      }
    },
    favorites: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: []
    }
  },
  { timestamps: true }
);
const Figure = mongoose.model("Figure", figureSchema);
export default Figure;
