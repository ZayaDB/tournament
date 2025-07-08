module.exports = {
  // ... existing config ...
  theme: {
    extend: {
      keyframes: {
        "subtle-bounce": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "subtle-bounce": "subtle-bounce 1.2s infinite",
      },
    },
  },
  // ...
};
