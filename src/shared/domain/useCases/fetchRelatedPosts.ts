import { Author, Category, IPostRepository, Post } from '@/domain';
import { PostRepository } from '@/infrastructure/post';

// export const fetchRelatedPosts = async (): Promise<PostsResponse> => {
//   const response = await getRelatedPosts(categoryName);
//   return response;
// };

export class FetchRelatedPostsUseCase {
  private readonly postRepository: IPostRepository;

  constructor() {
    this.postRepository = new PostRepository();
  }

  public async execute(categoryName = ''): Promise<Post[]> {
    const response = await this.postRepository.getRelatedPosts(categoryName);
    const { posts } = response.data;
    return posts.edges.map(({ node }) => {
      const post = node;
      console.log({ post });
      const author: Author = { name: post.author.node.name };
      const categories: Category[] = post.categories.edges.map((category) => ({ name: category.node.name }));
      return {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        date: post.date,
        featuredImageUrl: post.featuredImage.node.sourceUrl ?? '/static/images/not_found.png',
        author,
        categories
      };
    });
  }
}
