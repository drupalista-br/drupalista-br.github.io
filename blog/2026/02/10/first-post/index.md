# Easy documentation with Docsy

> The Docsy Hugo theme lets project maintainers and contributors focus on content, not on reinventing a website infrastructure from scratch

---

LLMS index: [llms.txt](/llms.txt)

---

**This is a typical blog post that includes images.**

The front matter specifies the date of the blog post, its title, a short
description that will be displayed on the blog landing page, and its author.

## Including images

Here's an image that includes a byline and a caption.

<figure class="card rounded p-2 td-post-card mb-4 mt-4" style="max-width: 510px">
<img class="card-img-top" src="/blog/2026/02/10/first-post/featured-pexels-peter-xie-sunset-35157036_hu_ee14b67ade889976.jpg" width="500" height="300">
<figcaption class="card-body px-0 pt-2 pb-0">
<p class="card-text">



Image cropped to 500x300

<small class="text-body-secondary"><br/>Photo by Peter Xie from Pexels</small>
</p>
</figcaption>
</figure>


The front matter of this post specifies properties to be assigned to all image
resources:

```yaml
resources:
  - src: '**.{png,jpg}'
    params:
      byline: Photo by Peter Xie from Pexels
```

To include the image in a page, specify its details like this:

```go-html-template
{{< imgproc sunset Crop "500x300" >}}
Image cropped to 500x300
{{< /imgproc >}}
```

The image will be rendered at the size and byline specified in the front matter.
