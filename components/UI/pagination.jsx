import React, { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import { ArrowRightIcon } from "../icons";

const Index = React.memo(
  ({ postsPerPage, paginate, totalPosts, currentPage }) => {
    const [pageCount, setPageCount] = useState(0);

    useEffect(() => {
      setPageCount(Math.ceil(totalPosts / (+postsPerPage || 25)));
    }, [postsPerPage, totalPosts]);

    const handlePageClick = (event) => {
      paginate(event.selected + 1);
    };

    const isFirstPage = currentPage == 1;
    const isLastPage = currentPage == pageCount;

    return (
      <ReactPaginate
        previousLabel={
          <div
            className={`flex items-center gap-2 responsive-text-sm ${
              isFirstPage ? "text-[#9295A4]" : "text-neutral-07"
            }`}
          >
            <ArrowRightIcon
              color={isFirstPage ? "#9295A4" : "#141522"}
              className="size-4 rotate-180"
            />{" "}
            Trước
          </div>
        }
        nextLabel={
          <div
            className={`flex items-center gap-2 responsive-text-sm ${
              isLastPage ? "text-[#9295A4]" : "text-neutral-07"
            }`}
          >
            Sau{" "}
            <ArrowRightIcon
              color={isLastPage ? "#9295A4" : "#141522"}
              className="size-4"
            />
          </div>
        }
        onPageChange={handlePageClick}
        pageRangeDisplayed={3}
        marginPagesDisplayed={2}
        pageCount={pageCount}
        pageClassName="page-item"
        pageLinkClassName="page-link !responsive-text-sm"
        previousClassName="page-item rounded-lg border border-[#D0D5DD] mr-2"
        previousLinkClassName="page-link !responsive-text-sm"
        nextClassName="page-item rounded-lg border border-[#D0D5DD] ml-2"
        nextLinkClassName="page-link !responsive-text-sm"
        breakLabel="..."
        breakClassName="page-item"
        breakLinkClassName="page-link !responsive-text-sm"
        containerClassName="pagination"
        activeClassName="active"
        renderOnZeroPageCount={null}
        forcePage={currentPage - 1}
      />
    );
  }
);
export default Index;
