using System.Collections.Generic;
using System.Threading.Tasks;
using LibrarySystem.Domain.Entities;

namespace LibrarySystem.Application.Interfaces
{
    public interface ISruClientService
    {
        /// <summary>
        /// Tìm kiếm bản ghi theo ISBN trên thư viện đối tác qua giao thức SRU.
        /// Trả về chuỗi JSON thô chứa dữ liệu MARC đã được parse từ MARCXML.
        /// </summary>
        Task<List<MarcField>?> SearchByIsbnAsync(int targetId, string isbn);
    }
}
