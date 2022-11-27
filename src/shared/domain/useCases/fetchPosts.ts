import { Author, Category, IPostRepository, Post } from '@/domain';
import { isDevelopment } from '@/extension';
import { PostRepository } from '@/infrastructure/post';
import { Node, PostsResponse } from '@/infrastructure/types';

// export const fetchAllPosts = async (
//   posts: Array<Node>,
//   _offset: string
// ): Promise<{ nodes: Array<Node>; hasNextPage: boolean; offset: string }> => {
//   const res: PostsResponse = await getAllPosts(100, _offset);
//   if (!res.data.posts.pageInfo.hasNextPage || isDevelopment()) {
//     return {
//       nodes: [...posts, ...res.data.posts.edges],
//       hasNextPage: res.data.posts.pageInfo.hasNextPage,
//       offset: res.data.posts.pageInfo.endCursor
//     };
//   }
//   return fetchAllPosts([...posts, ...res.data.posts.edges], res.data.posts.pageInfo.endCursor);
// };

export class FetchPostsUseCase {
  private readonly postRepository: IPostRepository;

  constructor() {
    this.postRepository = new PostRepository();
  }

  private async makePosts(
    posts: Node[],
    _offset: string
  ): Promise<{ nodes: Array<Node>; hasNextPage: boolean; offset: string }> {
    const res: PostsResponse = await this.postRepository.getAllPosts(100, _offset);
    if (!res.data.posts.pageInfo.hasNextPage || isDevelopment()) {
      return {
        nodes: [...posts, ...res.data.posts.edges],
        hasNextPage: res.data.posts.pageInfo.hasNextPage,
        offset: res.data.posts.pageInfo.endCursor
      };
    }
    return this.makePosts([...posts, ...res.data.posts.edges], res.data.posts.pageInfo.endCursor);
  }

  public async execute(): Promise<Post[]> {
    const response = await this.makePosts([], '');
    const nodes = response.nodes;
    return nodes.map(({ node }) => {
      const post = node;
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
