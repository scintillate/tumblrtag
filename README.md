tumblrtag
=========

This javascript was written so that a user could add it to the page and it would generate a javascript object containing all the tags used in their posts along with their usage numbers.

e.g
Title: Post 1 
Text: Hello world
Tags: #hello #world

Title: Bad day
Text: I am sick
Tags: #sick #bad

Title: Bad day #2
Text: I am still sick
Tags: #sick


From the above blog, the generated javascript object would have this format
[
  bad     1
  hello   1
  sick    2
  world   1
]

A second function which can then be used to sort them is also included, this results in
[
  sick    2
  bad     1
  hello   1
  world   1
]

It can also be used to generate HTML and is easily changable.

Hopefully this is helpful to some people.
