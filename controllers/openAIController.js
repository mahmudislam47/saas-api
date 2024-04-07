const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const ContentHistory = require("../models/ContentHistory");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: "anything",
  baseURL: "https://gpt-api-v1.vercel.app/v1",
});

const openAIController = asyncHandler(async (req, res) => {
  const { prompt, tone, category } = req.body;

  try {
    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });

    //send the response
    const content = chatCompletion.choices[0].message.content;
    //create generate history
    const newContent = await ContentHistory.create({
      user: req.user._id,
      content,
      prompt,
      tone,
      category,
    });
    //send response
    res.status(200).json({ content, prompt, tone, category });
    // push content history into user
    const user = await User.findById(req?.user?._id);
    user.contentHistory.push(newContent?._id);

    // update user apiRequestCount
    user.apiRequestCount += 1;
    await user.save();
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = { openAIController };
