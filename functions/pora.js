module.exports = (function poralar() {
  const poralar = [];
  for (let i = 1; i <= 30; i++) {
    poralar.push({
      id: i,
      name: `${i}-pora`,
      isBooked: false,
    });
  }
  return poralar;
})();
