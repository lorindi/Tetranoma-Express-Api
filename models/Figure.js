import mongoose from "mongoose";
import { type } from "os";

const figureSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      require: true,
      minlength: 1,
    },
    description: {
      type: String,
      require: true,
      minlength: 5,
    },
    category: {
      type: String,
      require: true,
      enum: [
        film,
        game,
        comic,
        fantasy,
        miniatures,
        sci - fi,
        historical,
        animals,
        architecture,
        educational,
        decor,
      ],
    },
    images: {
      type: [],
      require: true,
    },
    price: {
      type: Number,
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
  },
  { timestamps: true }
);
const Figure = mongoose.model("Figure", figureSchema);
export default Figure;
