import React from 'react';
import { useRouter } from "next/router";
import ErrorPage from "next/error";
import { PostBody } from "../components/post/post-body";
import { PostHeader } from "../components/post/post-header";
import { Layout } from "../components/layouts/layout";
import { getPage } from "../lib/api";
import { PAGES } from "../lib/constants";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { useState } from "react";
import {Page} from '../types/post';

type Props = {
  page: Page;
}

const Post: NextPage<Props> = (props: Props) => {
  const { page } = props;
  const router = useRouter();
  const [word, setWord] = useState<string>("");

  const handleSearch = () =>
    router.replace(`/?word=${word}`, undefined, { shallow: true });

  if (!router.isFallback && !page?.slug) {
    return <ErrorPage statusCode={404} />;
  }

  return (
    <Layout
      title={page.title}
      description={page.content}
      word=''
      setWord={setWord}
      handleSearch={handleSearch}
    >
      <div className="px-8 mx-auto sm:px-10 sm:max-w-screen-md md:max-w-3xl lg:max-w-3xl">
        {router.isFallback
          ? <>Loading…</>
            : (
              <div className="px-5 my-10">
                <PostHeader
                  title={page.title}
                  date={page.date}
                  author={page.author?.node}
                />
                <PostBody content={page.content} />
              </div>
            )}
          </div>
    </Layout>
  );
};

export default Post;

export const getStaticProps: GetStaticProps = async (context) => {
  const { pageBy } = await getPage(context.params.slug.toString());
  return {
    props: {
      page: pageBy,
    },
  };
};

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: PAGES.map((page) => `/${page.url}`) || [],
    fallback: false,
  };
};
