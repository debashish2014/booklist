import { query as BookQuery, mutation as BookMutation, type as BookType } from "./Book/schema";
import { query as SubjectQuery, mutation as SubjectMutation, type as SubjectType } from "./Subject/schema";
import { query as LabelColorQuery, mutation as LabelColorMutation, type as LabelColorType } from "./LabelColor/schema";
import { query as TagQuery, mutation as TagMutation, type as TagType } from "./Tag/schema";
import { type as EditorialReviewType } from "./EditorialReview/schema";

export default `
  scalar JSON

  type QueryResultsMetadata {
    count: Int
  }

  input StringArrayUpdate {
    index: Int,
    value: String
  }

  input IntArrayUpdate {
    index: Int,
    value: Int
  }

  input FloatArrayUpdate {
    index: Int,
    value: Float
  }

  ${BookType}

  ${EditorialReviewType}

  ${SubjectType}

  ${LabelColorType}

  ${TagType}

  type Query {
    ${BookQuery}

    ${SubjectQuery}

    ${LabelColorQuery}

    ${TagQuery}
  }

  type Mutation {
    ${BookMutation}

    ${SubjectMutation}

    ${LabelColorMutation}

    ${TagMutation}
  }

`;
