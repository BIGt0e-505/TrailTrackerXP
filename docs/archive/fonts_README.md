# SamsungOne Font Setup

This app uses the SamsungOne font family. You need to add the font files to this directory.

## Required Font Files

Place the following font files in this directory:

- `SamsungOne-400.ttf` - Regular weight
- `SamsungOne-700.ttf` - Bold weight

## Where to Get SamsungOne

SamsungOne is Samsung's proprietary font. You can:

1. Download from Samsung's developer resources
2. Extract from a Samsung device
3. Use a similar alternative font and rename the files

## Alternative: Using a Different Font

If you want to use a different font:

1. Place your .ttf files in this directory
2. Update `App.js` to load your font files:

```javascript
await Font.loadAsync({
  'SamsungOne-400': require('./assets/fonts/YourFont-Regular.ttf'),
  'SamsungOne-700': require('./assets/fonts/YourFont-Bold.ttf'),
});
```

Or rename your font files to match `SamsungOne-400.ttf` and `SamsungOne-700.ttf`.
