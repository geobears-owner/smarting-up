---
title: Higher Math
subtitle: A journal from a failed olympiad student
---
<style>
blue {
  color: lightblue;
}
red {
  color: red;
}
orange {
    color: orange;
}
purple {
    color: purple;
}
</style>

## Cool Problem Diary

## Interesting Theorems

## Thoughts on Olympiad
## Interesting Higher Maths Stuffs

### My curiosity with unsolved prime conjectures

There's a huge number of fascinating problems regarding the prime numbers that are still open problems, or were fiendishly hard to solve. See Prime Numbers The Most Mysterious Figures in Math by David Wells to see some of these results. I've been particularly interested in <orange>Legendre's Conjecture</orange>, <red>Twin-Prime Conjecture</red>, Landau's $n^2+1$ primes, <blue>Goldbach conjecture</blue>. Hopefully one of these gets proven before I die.

Legendre and Goldbach hopefully ought to be pretty close to being solved, given that bounds are getting tighter.

### An interesting heuristic on why PNT is true
We prove the result that
$$\pi(n) \approx Li(x) = \int_{2}^{n} \frac{1}{\ln x} dx$$

I found this from some random document on a <a href=https://www.physics.harvard.edu/files/sol18.pdf>Harvard physics course.</a>

Thanks to Euclid, we know that $N$ is prime $\iff$ $\nexists p \mid N$ for all $p < \sqrt{N}$, $p$ prime.

We note that whether two separate primes $p$ and $q$ divide a number is `independent'. Therefore, let us consider the probability $P(N)$ that a number *of the size* $N$ is prime.
$$P(N) = (1-\frac{1}{p_1})(1-\frac{1}{p_2})\cdots(1-\frac{1}{p_k})$$
where $p_1 < p_2 < \cdots < p_k$ are the primes less than or equal to $\sqrt{N}$.

We are after a way to pin down $P(N)$ based on itself (something like a <blue>recursive or differential equation</blue>). A recursive seems difficult, perhaps we could pull off a differential equation. With that in mind, let us consider $P(N+n)$, for some small $n<<N$. Then,
$$P(N+n) = (1-\frac{1}{p_1})\cdots(1-\frac{1}{p_{k+i}})$$
where $p_{k+i}$ is the last prime less than or equal to $\sqrt{N+n}$. Since $\sqrt{N+n} \approx \sqrt{N}$ (on the same order) we can approximate
$$P(N+n)=P(N) \cdot (1-\frac{1}{\sqrt{N}})^i$$
From the numbers $\sqrt{N}$ up to $\sqrt{N+n}$, they each have a probability roughly $P(\sqrt{N})$ (since $N$ up to $N+n$ is same order) of being prime, and since there are $n$ `independent` events, we can say that 
$$i \approx nP(\sqrt{N}) \Longrightarrow P(N+n) = P(N)(1-\frac{1}{\sqrt{N}})^{nP(\sqrt{N})}$$
We pull **two tricks** now.
- For small $n$, $nP(\sqrt{N}) << \sqrt{N}$ so we may use a first order approx of $(1-x)^m \approx 1-mx$.
- $P(N+n) \approx P(N)+nP'(N)$
Therefore,
$$P(N)+nP'(N) = P(N)(1-\frac{1}{\sqrt{N}})^{nP(\sqrt{N})} = P(N)(1-\frac{nP(\sqrt{N})}{\sqrt{N}})$$
Simplifying,
$$P'(N) = -\frac{P(N)P(\sqrt{N})}{2N}$$
One can then check that $P(N)=\frac{1}{\ln N}$ is indeed a solution.

Now, we are essentially done, we would then expect
$$\pi(n) \approx \int_{2}^{n} P(x) dx = \int_{2}^{n} \frac{1}{\ln x} dx$$

### Viggo Brun Sieve

## Hallo

## Maths Education

