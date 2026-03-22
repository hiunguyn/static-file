# 📐 Hướng dẫn viết công thức Toán học & Hoá học

---

## 🔧 Cú pháp cơ bản

| Loại | Cú pháp Markdown | Mô tả |
|------|-----------------|-------|
| Inline (nội tuyến) | `$...$` | Công thức nằm trong dòng chữ |
| Block (khối riêng) | `$$...$$` | Công thức hiển thị trên dòng riêng, canh giữa |

---

## 🔢 Toán học cơ bản

### 1. Số và phép tính

| Muốn hiển thị | Viết trong Markdown |
|--------------|---------------------|
| $a + b$ | `$a + b$` |
| $a - b$ | `$a - b$` |
| $a \times b$ | `$a \times b$` |
| $a \div b$ | `$a \div b$` |
| $a \cdot b$ | `$a \cdot b$` |
| $a \pm b$ | `$a \pm b$` |
| $\frac{a}{b}$ | `$\frac{a}{b}$` |

### 2. Luỹ thừa và chỉ số

| Muốn hiển thị | Viết trong Markdown |
|--------------|---------------------|
| $x^2$ | `$x^2$` |
| $x^{10}$ | `$x^{10}$` |
| $x_1$ | `$x_1$` |
| $x_{10}$ | `$x_{10}$` |
| $x_1^2$ | `$x_1^2$` |
| $x^{a+b}$ | `$x^{a+b}$` |
| $2^{32}$ | `$2^{32}$` |

### 3. Căn bậc hai và căn bậc n

| Muốn hiển thị | Viết trong Markdown |
|--------------|---------------------|
| $\sqrt{x}$ | `$\sqrt{x}$` |
| $\sqrt{x+y}$ | `$\sqrt{x+y}$` |
| $\sqrt[3]{x}$ | `$\sqrt[3]{x}$` |
| $\sqrt[n]{x^2+y^2}$ | `$\sqrt[n]{x^2+y^2}$` |

### 4. Phân số phức tạp

| Muốn hiển thị | Viết trong Markdown |
|--------------|---------------------|
| $\frac{1}{2}$ | `$\frac{1}{2}$` |
| $\frac{x+1}{x-1}$ | `$\frac{x+1}{x-1}$` |
| $\frac{\sqrt{2}}{2}$ | `$\frac{\sqrt{2}}{2}$` |
| $\frac{a}{\frac{b}{c}}$ | `$\frac{a}{\frac{b}{c}}$` |

---

## 🔠 Ký hiệu Hy Lạp phổ biến

| Ký hiệu | Viết | Ký hiệu | Viết |
|---------|------|---------|------|
| $\alpha$ | `$\alpha$` | $\Alpha$ | `$\Alpha$` |
| $\beta$ | `$\beta$` | $\Beta$ | `$\Beta$` |
| $\gamma$ | `$\gamma$` | $\Gamma$ | `$\Gamma$` |
| $\delta$ | `$\delta$` | $\Delta$ | `$\Delta$` |
| $\epsilon$ | `$\epsilon$` | $\Epsilon$ | `$\Epsilon$` |
| $\theta$ | `$\theta$` | $\Theta$ | `$\Theta$` |
| $\lambda$ | `$\lambda$` | $\Lambda$ | `$\Lambda$` |
| $\mu$ | `$\mu$` | $\pi$ | `$\pi$` |
| $\sigma$ | `$\sigma$` | $\Sigma$ | `$\Sigma$` |
| $\omega$ | `$\omega$` | $\Omega$ | `$\Omega$` |
| $\phi$ | `$\phi$` | $\Phi$ | `$\Phi$` |
| $\psi$ | `$\psi$` | $\Psi$ | `$\Psi$` |

---

## ∑ Tổng, tích phân, giới hạn

### Tổng (Sigma)

| Muốn hiển thị | Viết trong Markdown |
|--------------|---------------------|
| $\sum_{i=1}^{n} x_i$ | `$\sum_{i=1}^{n} x_i$` |
| $$\sum_{i=1}^{n} x_i$$ | `$$\sum_{i=1}^{n} x_i$$` |

### Tích phân

| Muốn hiển thị | Viết trong Markdown |
|--------------|---------------------|
| $\int f(x)dx$ | `$\int f(x)dx$` |
| $\int_0^1 f(x)dx$ | `$\int_0^1 f(x)dx$` |
| $\iint$ | `$\iint$` |
| $\oint$ | `$\oint$` |

### Giới hạn

| Muốn hiển thị | Viết trong Markdown |
|--------------|---------------------|
| $\lim_{x \to 0}$ | `$\lim_{x \to 0}$` |
| $\lim_{x \to \infty} \frac{1}{x} = 0$ | `$\lim_{x \to \infty} \frac{1}{x} = 0$` |

### Tích (Pi)

| Muốn hiển thị | Viết trong Markdown |
|--------------|---------------------|
| $\prod_{i=1}^{n} x_i$ | `$\prod_{i=1}^{n} x_i$` |

---

## 🔣 So sánh và quan hệ

| Muốn hiển thị | Viết | Muốn hiển thị | Viết |
|--------------|------|--------------|------|
| $=$ | `$=$` | $\neq$ | `$\neq$` |
| $<$ | `$<$` | $>$ | `$>$` |
| $\leq$ | `$\leq$` | $\geq$ | `$\geq$` |
| $\approx$ | `$\approx$` | $\equiv$ | `$\equiv$` |
| $\sim$ | `$\sim$` | $\propto$ | `$\propto$` |
| $\in$ | `$\in$` | $\notin$ | `$\notin$` |
| $\subset$ | `$\subset$` | $\supset$ | `$\supset$` |
| $\cup$ | `$\cup$` | $\cap$ | `$\cap$` |
| $\infty$ | `$\infty$` | $\emptyset$ | `$\emptyset$` |

---

## 📐 Toán học nâng cao

### Ma trận

```markdown
$$
\begin{pmatrix}
a & b \\
c & d
\end{pmatrix}
$$
```

Kết quả:

$$\begin{pmatrix} a & b \\ c & d \end{pmatrix}$$

| Loại ngoặc | Cú pháp |
|-----------|---------|
| `( )` tròn | `\begin{pmatrix}...\end{pmatrix}` |
| `[ ]` vuông | `\begin{bmatrix}...\end{bmatrix}` |
| `{ }` nhọn | `\begin{Bmatrix}...\end{Bmatrix}` |
| `\| \|` | `\begin{vmatrix}...\end{vmatrix}` |
| không có ngoặc | `\begin{matrix}...\end{matrix}` |

### Hệ phương trình

```markdown
$$
\begin{cases}
x + y = 5 \\
2x - y = 1
\end{cases}
$$
```

Kết quả:

$$
\begin{cases}
x + y = 5 \\
2x - y = 1
\end{cases}
$$

### Phương trình nhiều dòng (align)

```markdown
$$
\begin{align}
f(x) &= x^2 + 2x + 1 \\
     &= (x+1)^2
\end{align}
$$
```

Kết quả:

$$
\begin{align}
f(x) &= x^2 + 2x + 1 \\
     &= (x+1)^2
\end{align}
$$

---

## ⚗️ Hoá học

### Công thức phân tử

| Muốn hiển thị | Viết trong Markdown |
|--------------|---------------------|
| $H_2O$ | `$H_2O$` |
| $CO_2$ | `$CO_2$` |
| $H_2SO_4$ | `$H_2SO_4$` |
| $C_6H_{12}O_6$ | `$C_6H_{12}O_6$` |
| $NaHCO_3$ | `$NaHCO_3$` |
| $Ca(OH)_2$ | `$Ca(OH)_2$` |

### Phản ứng hoá học

```markdown
$$
2H_2 + O_2 \rightarrow 2H_2O
$$
```

Kết quả:

$$
2H_2 + O_2 \rightarrow 2H_2O
$$

```markdown
$$
CH_4 + 2O_2 \rightarrow CO_2 + 2H_2O
$$
```

Kết quả:

$$
CH_4 + 2O_2 \rightarrow CO_2 + 2H_2O
$$

### Mũi tên phản ứng

| Ký hiệu | Viết | Ý nghĩa |
|---------|------|---------|
| $\rightarrow$ | `$\rightarrow$` | Phản ứng một chiều |
| $\leftarrow$ | `$\leftarrow$` | Phản ứng ngược |
| $\rightleftharpoons$ | `$\rightleftharpoons$` | Phản ứng thuận nghịch |
| $\leftrightarrow$ | `$\leftrightarrow$` | Cân bằng |
| $\Rightarrow$ | `$\Rightarrow$` | Suy ra |
| $\uparrow$ | `$\uparrow$` | Khí bay lên |
| $\downarrow$ | `$\downarrow$` | Kết tủa |

### Ion và điện tích

| Muốn hiển thị | Viết trong Markdown |
|--------------|---------------------|
| $Na^+$ | `$Na^+$` |
| $Cl^-$ | `$Cl^-$` |
| $Ca^{2+}$ | `$Ca^{2+}$` |
| $SO_4^{2-}$ | `$SO_4^{2-}$` |
| $Fe^{3+}$ | `$Fe^{3+}$` |
| $OH^-$ | `$OH^-$` |



## ✏️ Ví dụ thực tế (Block)

### Phương trình bậc hai

```markdown
$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$
```

Kết quả:

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

### Định lý Pythagoras

```markdown
$$
c^2 = a^2 + b^2
$$
```

Kết quả:

$$
c^2 = a^2 + b^2
$$

### Công thức Euler

```markdown
$$
e^{i\pi} + 1 = 0
$$
```

Kết quả:

$$
e^{i\pi} + 1 = 0
$$

### Định luật bảo toàn khối lượng

```markdown
$$
\sum m_{trước} = \sum m_{sau}
$$
```

Kết quả:

$$
\sum m_{trước} = \sum m_{sau}
$$

### Chuỗi Taylor

```markdown
$$
f(x) = \sum_{n=0}^{\infty} \frac{f^{(n)}(a)}{n!}(x-a)^n
$$
```

Kết quả:

$$
f(x) = \sum_{n=0}^{\infty} \frac{f^{(n)}(a)}{n!}(x-a)^n
$$

---

## ⚠️ Lưu ý quan trọng

| Vấn đề | Giải thích |
|--------|-----------|
| Dùng `$` inline | Viết `$x^2$` để hiện $x^2$ trong dòng chữ |
| Dùng `$$` block | Viết `$$x^2$$` để hiển thị trên dòng riêng |
| Nhóm nhiều ký tự | Dùng `{}`: `x^{10}` thay vì `x^10` (chỉ lấy `1`) |
| Khoảng trắng | KaTeX tự xử lý, không cần thêm thủ công |
| Dấu `_` ngoài công thức | Phải escape: `\_` nếu không muốn bị nhận là KaTeX |
| Ngoặc lớn tự động | Dùng `\left(` và `\right)` để ngoặc co giãn theo nội dung |

### Ngoặc tự động co giãn

```markdown
$$
\left( \frac{x+1}{x-1} \right)^2
$$
```

Kết quả:

$$
\left( \frac{x+1}{x-1} \right)^2
$$
