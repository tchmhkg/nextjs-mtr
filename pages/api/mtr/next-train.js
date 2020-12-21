import axios from "axios";
import { MTR_NEXT_TRAIN_API } from "~/utils/apiUrls";

export default async function handler(req, res) {
  const {line, sta, lang = 'en'} = req.query;

  try {
    const apiRes = await axios.get(MTR_NEXT_TRAIN_API, {
      params: {
        line,
        sta,
        lang
      }
    });
    res.json({
      success: true,
      data: apiRes?.data || [],
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      data: [],
    });
  }
}