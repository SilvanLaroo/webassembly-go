package main

var total = 0

func main() {}

//export addToCart
func addToCart(x int) int {
  total = total + x
  return total
}

//export setTotals
func setTotals(x int) {
  total = x
}

//export resetTotals
func resetTotals() int {
  total = 0
  return total
}